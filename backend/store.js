const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'db.json');

function newId() {
  return crypto.randomUUID();
}

async function readDb() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { users: [], projects: [] };
    }
    throw error;
  }
}

async function writeDb(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2), 'utf8');
}

// ─── Admin Init ────────────────────────────────────────────────────────────────
async function initializeAdmin() {
  const db = await readDb();
  let admin = db.users.find(u => u.email === 'admin@pccoepune.org');
  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin@1234', 10);
    admin = {
      id: 'admin-001',
      firstName: 'Admin',
      lastName: 'PCCOE',
      name: 'Admin PCCOE',
      email: 'admin@pccoepune.org',
      passwordHash,
      role: 'admin',
      department: 'CSE AI&ML',
      phone: '',
      year: '',
      batch: '',
      rollNumber: '',
      createdAt: new Date().toISOString()
    };
    db.users.push(admin);
    await writeDb(db);
    console.log('✅ Admin user initialized: admin@pccoepune.org / Admin@1234');
  }
}

// ─── Users ─────────────────────────────────────────────────────────────────────
async function findUserByEmail(email) {
  const db = await readDb();
  const normalized = String(email).trim().toLowerCase();
  return db.users.find(u => u.email === normalized) || null;
}

async function findUserById(id) {
  const db = await readDb();
  return db.users.find(u => u.id === String(id)) || null;
}

async function createUser(input) {
  const db = await readDb();
  const firstName = String(input.firstName || '').trim();
  const lastName = String(input.lastName || '').trim();
  const user = {
    id: newId(),
    firstName,
    lastName,
    name: firstName + ' ' + lastName,
    email: String(input.email).trim().toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role || 'student',
    department: input.department || 'CSE AI&ML',
    phone: input.phone || '',
    year: input.year || '',
    batch: input.batch || '',
    rollNumber: input.rollNumber || '',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  await writeDb(db);
  return user;
}

async function listUsers() {
  const db = await readDb();
  return db.users;
}

// ─── Projects ──────────────────────────────────────────────────────────────────
async function listProjects(filters = {}) {
  const db = await readDb();
  let projects = [...db.projects];

  // Sorting
  const sort = filters.sort || 'recent';
  if (sort === 'oldest') {
    projects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'az') {
    projects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    // default: recent first
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Full-text search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    projects = projects.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.teamName || '').toLowerCase().includes(q) ||
      (p.submittedByName || '').toLowerCase().includes(q) ||
      (p.domain || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }

  // Batch filter
  if (filters.batch) {
    projects = projects.filter(p => p.batch === filters.batch);
  }

  // Year filter
  if (filters.year) {
    projects = projects.filter(p => p.year === filters.year);
  }

  // Domain filter (supports comma-separated)
  if (filters.domain) {
    const domains = filters.domain.split(',').map(d => d.trim().toLowerCase());
    projects = projects.filter(p => domains.includes((p.domain || '').toLowerCase()));
  }

  // Owner filter (for /mine endpoint)
  if (filters.ownerId) {
    projects = projects.filter(p => p.submittedBy === String(filters.ownerId));
  }

  const total = projects.length;

  // Pagination
  const limit = Math.min(Number(filters.limit) || 9, 1000);
  const page = Number(filters.page) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = projects.slice(startIndex, startIndex + limit);

  return {
    total,
    projects: paginated,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
}

async function findProjectById(id) {
  const db = await readDb();
  return db.projects.find(p => p.id === String(id)) || null;
}

async function createProject(input) {
  const db = await readDb();
  const project = {
    id: newId(),
    title: String(input.title).trim(),
    teamName: String(input.teamName || '').trim(),
    teamMembers: String(input.teamMembers || '').trim(),
    domain: String(input.domain).trim(),
    description: String(input.description).trim(),
    guideName: String(input.guideName || '').trim(),
    year: String(input.year).trim(),
    batch: String(input.batch).trim(),
    techStack: String(input.techStack || '').trim(),
    githubLink: input.githubLink || null,
    linkedinLink: input.linkedinLink || null,
    researchPaperFile: input.researchPaperFile || '',
    presentationFile: input.presentationFile || null,
    submittedBy: String(input.submittedBy),
    submittedByName: String(input.submittedByName),
    submittedByEmail: String(input.submittedByEmail),
    createdAt: new Date().toISOString()
  };
  db.projects.push(project);
  await writeDb(db);
  return project;
}

async function deleteProject(id) {
  const db = await readDb();
  const before = db.projects.length;
  db.projects = db.projects.filter(p => p.id !== String(id));
  if (db.projects.length === before) return false;
  await writeDb(db);
  return true;
}

async function getStats() {
  const db = await readDb();
  const students = db.users.filter(u => u.role !== 'admin');
  const batches = [...new Set(db.projects.map(p => p.batch).filter(Boolean))];
  return {
    totalProjects: db.projects.length,
    totalStudents: students.length,
    totalBatches: batches.length
  };
}

module.exports = {
  initializeAdmin,
  findUserByEmail,
  findUserById,
  createUser,
  listUsers,
  listProjects,
  findProjectById,
  createProject,
  deleteProject,
  getStats
};