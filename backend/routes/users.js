const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, department, phone, year, batch } = req.body;
    const updated = await store.updateUser(req.user.id, { name, department, phone, year, batch });
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { passwordHash, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.put('/me/password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Provide old and new password' });
    }
    
    const user = await store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await store.updateUser(req.user.id, { passwordHash });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

router.get('/:id/projects', async (req, res) => {
  try {
    const result = await store.listProjects({ ownerId: req.params.id, limit: 100 });
    res.json(result.projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

module.exports = router;
