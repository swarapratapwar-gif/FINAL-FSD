const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'db.json');

function newId() {
  return crypto.randomUUID();
}

async function readDb() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.projects) {
      return { users: [], projects: [] };
    }
    return parsed;
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

async function findUserByEmail(email) {
  const db = await readDb();
  const normalized = String(email).trim().toLowerCase();
  return db.users.find((user) => user.email === normalized) || null;
}

async function findUserById(id) {
  const db = await readDb();
  return db.users.find((user) => user.id === String(id)) || null;
}

async function createUser(input) {
  const db = await readDb();
  const user = {
    id: newId(),
    name: String(input.name).trim(),
    email: String(input.email).trim().toLowerCase(),
    password: input.password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.users.push(user);
  await writeDb(db);
  return user;
}

async function listProjects(batch) {
  const db = await readDb();
  const projects = db.projects.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!batch || batch === 'all') {
    return projects;
  }

  return projects.filter((item) => item.batch === String(batch));
}

async function findProjectById(id) {
  const db = await readDb();
  return db.projects.find((item) => item.id === String(id)) || null;
}

async function createProject(input) {
  const db = await readDb();
  const project = {
    id: newId(),
    title: String(input.title).trim(),
    description: String(input.description).trim(),
    techStack: String(input.techStack).trim(),
    batch: String(input.batch).trim(),
    github: input.github ? String(input.github).trim() : '',
    linkedin: input.linkedin ? String(input.linkedin).trim() : '',
    researchPaper: input.researchPaper ? String(input.researchPaper).trim() : '',
    presentation: input.presentation ? String(input.presentation).trim() : '',
    ownerId: String(input.ownerId),
    ownerName: String(input.ownerName),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.projects.push(project);
  await writeDb(db);
  return project;
}

async function updateProject(id, input) {
  const db = await readDb();
  const index = db.projects.findIndex((item) => item.id === String(id));
  if (index === -1) {
    return null;
  }

  db.projects[index] = {
    ...db.projects[index],
    title: String(input.title).trim(),
    description: String(input.description).trim(),
    techStack: String(input.techStack).trim(),
    batch: String(input.batch).trim(),
    github: input.github ? String(input.github).trim() : '',
    linkedin: input.linkedin ? String(input.linkedin).trim() : '',
    updatedAt: new Date().toISOString()
  };

  await writeDb(db);
  return db.projects[index];
}

async function deleteProject(id) {
  const db = await readDb();
  const before = db.projects.length;
  db.projects = db.projects.filter((item) => item.id !== String(id));
  if (db.projects.length === before) {
    return false;
  }
  await writeDb(db);
  return true;
}

async function listBatches() {
  const db = await readDb();
  const batches = Array.from(new Set(db.projects.map((item) => item.batch)));
  return batches.sort((a, b) => Number(b) - Number(a));
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  listProjects,
  findProjectById,
  createProject,
  updateProject,
  deleteProject,
  listBatches
};