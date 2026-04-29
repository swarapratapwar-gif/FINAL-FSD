const express = require('express');
const store = require('../store');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/projects — list all with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      search: req.query.q || req.query.search,
      batch: req.query.batch,
      year: req.query.year,
      domain: req.query.domain,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };
    const result = await store.listProjects(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/projects/search — full-text search
router.get('/search', async (req, res) => {
  try {
    const filters = {
      search: req.query.q,
      batch: req.query.batch,
      year: req.query.year,
      domain: req.query.domain,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };
    const result = await store.listProjects(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/projects/suggestions — autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (q.length < 2) return res.json([]);

    const result = await store.listProjects({ limit: 1000 });
    const matches = result.projects
      .filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.teamName || '').toLowerCase().includes(q) ||
        (p.submittedByName || '').toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map(p => ({ id: p.id, title: p.title, batch: p.batch }));

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/projects/batches — unique batch values
router.get('/batches', async (req, res) => {
  try {
    const result = await store.listProjects({ limit: 10000 });
    const batches = [...new Set(result.projects.map(p => p.batch).filter(Boolean))];
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/projects/mine — user's own projects (protected)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const result = await store.listProjects({ ownerId: req.user.id, limit: 1000 });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// GET /api/projects/:id — single project
router.get('/:id', async (req, res) => {
  try {
    const project = await store.findProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// POST /api/projects — submit project (protected)
const cpUpload = upload.fields([
  { name: 'researchPaper', maxCount: 1 },
  { name: 'presentation', maxCount: 1 }
]);

router.post('/', requireAuth, cpUpload, async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    const {
      title, description, techStack, domain, teamName, teamMembers,
      guideName, year, batch, githubLink, linkedinLink
    } = req.body;

    if (!title || !description || !year || !batch || !domain) {
      return res.status(400).json({ message: 'Please fill all mandatory fields' });
    }

    if (!req.files || !req.files['researchPaper']) {
      return res.status(400).json({ message: 'Research Paper PDF is required' });
    }

    const projectData = {
      title,
      description,
      techStack: techStack || '',
      domain,
      teamName: teamName || req.user.name,
      teamMembers: teamMembers || '',
      guideName: guideName || 'Not Specified',
      year,
      batch,
      githubLink: githubLink || null,
      linkedinLink: linkedinLink || null,
      researchPaperFile: req.files['researchPaper'][0].filename,
      presentationFile: req.files['presentation'] ? req.files['presentation'][0].filename : null,
      submittedBy: req.user.id,
      submittedByName: req.user.name,
      submittedByEmail: req.user.email
    };

    const project = await store.createProject(projectData);
    res.status(201).json({ message: 'Project submitted successfully!', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// DELETE /api/projects/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const allowedEmails = [
      'swara.pratapwar24@pccoepune.org',
      'samrudhi.divekar24@pccoepune.org',
      'samrudhi.dhumal24@pccoepune.org',
      'admin@pccoepune.org',
      'admin@pccoe.org'
    ];
    if (!allowedEmails.includes(userEmail)) {
      return res.status(403).json({ message: 'You do not have permission to delete projects.' });
    }

    const project = await store.findProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await store.deleteProject(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

module.exports = router;