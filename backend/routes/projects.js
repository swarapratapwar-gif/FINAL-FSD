const express = require('express');
const store = require('../store');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function normalizeQuery(q) {
  return q ? String(q).trim().toLowerCase() : '';
}

router.get('/', async (req, res) => {
  try {
    const projects = await store.listProjects(req.query.batch);
    return res.status(200).json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    return res.status(500).json({ message: 'Error fetching projects' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = normalizeQuery(req.query.q);
    if (!q) {
      return res.status(200).json([]);
    }

    const all = await store.listProjects(req.query.batch);
    const ranked = all
      .filter((item) => {
        const title = item.title.toLowerCase();
        const description = item.description.toLowerCase();
        const techStack = item.techStack.toLowerCase();
        return title.includes(q) || description.includes(q) || techStack.includes(q);
      })
      .map((item) => {
        const title = item.title.toLowerCase();
        let score = 0;
        if (title === q) score += 100;
        if (title.startsWith(q)) score += 80;
        if (title.includes(q)) score += 50;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    return res.status(200).json(ranked);
  } catch (error) {
    console.error('Search projects error:', error);
    return res.status(500).json({ message: 'Error searching projects' });
  }
});

router.get('/suggestions', async (req, res) => {
  try {
    const q = normalizeQuery(req.query.q);
    if (!q) {
      return res.status(200).json([]);
    }

    const all = await store.listProjects();
    const suggestions = all
      .filter((item) => item.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((item) => ({ id: item.id, title: item.title, batch: item.batch }));

    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    return res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

router.get('/batches', async (req, res) => {
  try {
    const batches = await store.listBatches();
    return res.status(200).json(batches);
  } catch (error) {
    console.error('Batches error:', error);
    return res.status(500).json({ message: 'Error fetching batches' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await store.findProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(200).json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({ message: 'Error fetching project' });
  }
});

router.post('/', protect, upload.fields([
  { name: 'researchPaper', maxCount: 1 },
  { name: 'presentation', maxCount: 1 }
]), async (req, res) => {
  try {
    // req.body should contain form fields, req.files contains uploaded files
    const title = req.body ? req.body.title : undefined;
    const description = req.body ? req.body.description : undefined;
    const techStack = req.body ? req.body.techStack : undefined;
    const batch = req.body ? req.body.batch : undefined;
    const github = req.body ? req.body.github : undefined;
    const linkedin = req.body ? req.body.linkedin : undefined;
    
    if (!title || !description || !techStack || !batch) {
      return res.status(400).json({ message: 'Please fill all required fields including batch year' });
    }

    // Check for mandatory research paper file
    if (!req.files || !req.files.researchPaper || req.files.researchPaper.length === 0) {
      return res.status(400).json({ message: 'Research paper PDF is required' });
    }

    const projectData = {
      title: String(title).trim(),
      description: String(description).trim(),
      techStack: String(techStack).trim(),
      batch: String(batch).trim(),
      github: github ? String(github).trim() : '',
      linkedin: linkedin ? String(linkedin).trim() : '',
      ownerId: req.user.id,
      ownerName: req.user.name,
      researchPaper: req.files.researchPaper[0].filename
    };

    // Add presentation if provided
    if (req.files.presentation && req.files.presentation.length > 0) {
      projectData.presentation = req.files.presentation[0].filename;
    }

    const project = await store.createProject(projectData);

    return res.status(201).json({ message: 'Project created successfully!', project });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ message: 'Error creating project' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const existing = await store.findProjectById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed. You can only edit your own projects.' });
    }

    const updated = await store.updateProject(req.params.id, req.body);
    return res.status(200).json({ message: 'Project updated successfully!', project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ message: 'Error updating project' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const existing = await store.findProjectById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (existing.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed. You can only delete your own projects.' });
    }

    await store.deleteProject(req.params.id);
    return res.status(200).json({ message: 'Project deleted successfully!' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ message: 'Error deleting project' });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size exceeds 50MB limit' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ message: 'Too many files' });
  }
  if (err.message && err.message.includes('Only PDF files are allowed')) {
    return res.status(400).json({ message: 'Only PDF files are allowed' });
  }
  if (err) {
    console.error('File upload error:', err);
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  next();
});

module.exports = router;