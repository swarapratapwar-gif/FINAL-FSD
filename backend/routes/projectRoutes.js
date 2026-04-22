const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const protect = require('../middleware/authMiddleware');

console.log('✅ projectRoutes.js loaded');

// ===================================
// SANITIZE INPUT HELPER
// ===================================
function sanitizeQuery(query) {
  if (!query) return '';
  return query.trim().substring(0, 100);
}

// ===================================
// ROUTE 1: GET ALL PROJECTS
// GET /api/projects
// Supports batch filter: ?batch=2025
// ===================================
router.get('/', async (req, res) => {
  try {
    const batch = req.query.batch;
    let filter = {};

    // If batch is provided and not "all"
    if (batch && batch !== 'all') {
      filter.batch = batch;
    }

    console.log('📋 GET / filter:', filter);

    const projects = await Project
      .find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error('GET / error:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// ===================================
// ROUTE 2: SEARCH PROJECTS
// GET /api/projects/search?q=keyword&batch=2025
// ===================================
router.get('/search', async (req, res) => {
  try {
    const query = sanitizeQuery(req.query.q);
    const batch = req.query.batch;

    console.log('🔍 /search query:', query, 'batch:', batch);

    if (!query) {
      return res.status(200).json([]);
    }

    // Build filter object
    let filter = {
      $or: [
        { title:       { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { techStack:   { $regex: query, $options: 'i' } }
      ]
    };

    // Add batch filter if provided
    if (batch && batch !== 'all') {
      filter.batch = batch;
    }

    const allMatches = await Project.find(filter);

    // Smart ranking by score
    const scored = allMatches.map(function(project) {
      let score = 0;
      const q     = query.toLowerCase();
      const title = project.title.toLowerCase();
      const desc  = project.description.toLowerCase();
      const tech  = project.techStack.toLowerCase();

      if (title === q)         score += 100;
      if (title.startsWith(q)) score += 80;
      if (title.includes(q))   score += 60;
      if (desc.includes(q))    score += 30;
      if (tech.includes(q))    score += 20;

      return { project, score };
    });

    scored.sort(function(a, b) { return b.score - a.score; });
    const results = scored.map(function(item) {
      return item.project;
    });

    console.log('✅ Search found:', results.length);
    res.status(200).json(results);

  } catch (error) {
    console.error('❌ /search error:', error);
    res.status(500).json({ message: 'Error searching projects' });
  }
});

// ===================================
// ROUTE 3: AUTOCOMPLETE SUGGESTIONS
// GET /api/projects/suggestions?q=keyword
// ===================================
router.get('/suggestions', async (req, res) => {
  try {
    const query = sanitizeQuery(req.query.q);

    if (!query) {
      return res.status(200).json([]);
    }

    const matches = await Project.find(
      { title: { $regex: query, $options: 'i' } },
      { title: 1, _id: 1, batch: 1 }
    ).limit(6);

    const sorted = matches.sort(function(a, b) {
      const q = query.toLowerCase();
      const aStarts = a.title.toLowerCase().startsWith(q);
      const bStarts = b.title.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    res.status(200).json(sorted);
  } catch (error) {
    console.error('❌ /suggestions error:', error);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

// ===================================
// ROUTE 4: GET ALL BATCHES
// GET /api/projects/batches
// Returns unique batch years for dropdown
// ===================================
router.get('/batches', async (req, res) => {
  try {
    // Get all unique batch values from database
    const batches = await Project.distinct('batch');

    // Sort batches numerically
    batches.sort(function(a, b) {
      return parseInt(b) - parseInt(a);
    });

    console.log('📅 Batches:', batches);
    res.status(200).json(batches);
  } catch (error) {
    console.error('❌ /batches error:', error);
    res.status(500).json({ message: 'Error fetching batches' });
  }
});

// ===================================
// ROUTE 5: GET SINGLE PROJECT
// GET /api/projects/:id
// MUST be AFTER all named routes
// ===================================
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('❌ /:id error:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// ===================================
// ROUTE 6: CREATE PROJECT
// POST /api/projects
// ===================================
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      techStack,
      batch,      // ✅ NEW
      github,     // ✅ NEW
      linkedin    // ✅ NEW
    } = req.body;

    // Required fields check
    if (!title || !description || !techStack || !batch) {
      return res.status(400).json({
        message: 'Please fill all required fields including batch year'
      });
    }

    // Validate batch is a valid year
    const batchYear = parseInt(batch);
    if (isNaN(batchYear) || batchYear < 2000 || batchYear > 2100) {
      return res.status(400).json({
        message: 'Please enter a valid batch year (e.g. 2025)'
      });
    }

    // Validate GitHub URL if provided
    if (github && github.trim() !== '') {
      const isValidGithub = github.includes('github.com') ||
        github.startsWith('http');
      if (!isValidGithub) {
        return res.status(400).json({
          message: 'Please enter a valid GitHub URL'
        });
      }
    }

    const project = await Project.create({
      title:       title.trim(),
      description: description.trim(),
      techStack:   techStack.trim(),
      batch:       batch.toString().trim(),
      github:      github ? github.trim() : '',
      linkedin:    linkedin ? linkedin.trim() : '',
      owner:       req.user.id,
      ownerName:   req.user.name
    });

    res.status(201).json({
      message: 'Project created successfully!',
      project
    });

  } catch (error) {
    console.error('POST / error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// ===================================
// ROUTE 7: UPDATE PROJECT
// PUT /api/projects/:id
// ===================================
router.put('/:id', protect, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not allowed. You can only edit your own projects.'
      });
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      {
        title:       req.body.title.trim(),
        description: req.body.description.trim(),
        techStack:   req.body.techStack.trim(),
        batch:       req.body.batch.toString().trim(),  // ✅ NEW
        github:      req.body.github ?
          req.body.github.trim() : '',                  // ✅ NEW
        linkedin:    req.body.linkedin ?
          req.body.linkedin.trim() : ''                 // ✅ NEW
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Project updated successfully!',
      project: updated
    });

  } catch (error) {
    console.error('PUT /:id error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

// ===================================
// ROUTE 8: DELETE PROJECT
// DELETE /api/projects/:id
// ===================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not allowed. You can only delete your own projects.'
      });
    }

    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: 'Project deleted successfully!' });

  } catch (error) {
    console.error('DELETE /:id error:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

module.exports = router;