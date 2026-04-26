const express = require('express');
const store = require('../store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const stats = await store.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await store.listUsers();
    res.json(users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const result = await store.listProjects({ limit: 1000 }); // get all for admin
    res.json(result.projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === 'admin-001') {
      return res.status(403).json({ message: 'Cannot delete primary admin' });
    }
    const success = await store.deleteUser(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const success = await store.deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

module.exports = router;
