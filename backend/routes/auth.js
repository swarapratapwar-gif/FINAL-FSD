const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../store');

const router = express.Router();
const pccoEmailRegex = /^[a-zA-Z0-9._%+-]+@pccoepune\.org$/i;

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, phone, year, batch, rollNumber, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all mandatory fields' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!pccoEmailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Only valid PCCOE emails accepted. Format: firstname.lastname24@pccoepune.org' });
    }

    const existing = await store.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Admin override
    const assignedRole = normalizedEmail === 'admin@pccoepune.org' ? 'admin' : (role || 'student');

    const user = await store.createUser({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      passwordHash,
      department: department || 'CSE AI&ML',
      phone: phone || '',
      year: year || '',
      batch: batch || '',
      rollNumber: rollNumber || '',
      role: assignedRole
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.firstName + ' ' + user.lastName,
        email: user.email, 
        role: user.role,
        department: user.department,
        year: user.year,
        batch: user.batch,
        rollNumber: user.rollNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully! Please log in.',
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error. Try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    console.log(`Login attempt: ${normalizedEmail}`);

    // Allow admin@pccoepune.org or admin@pccoe.org (fallback)
    const isAdmin = normalizedEmail === 'admin@pccoepune.org' || normalizedEmail === 'admin@pccoe.org';

    if (!pccoEmailRegex.test(normalizedEmail) && !isAdmin) {
      return res.status(400).json({ message: 'Only valid PCCOE college emails are accepted.' });
    }

    const user = await store.findUserByEmail(normalizedEmail);
    if (!user) {
      console.log('User not found in DB');
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    const hash = user.passwordHash || user.password;
    if (!hash) {
        console.error(`User ${user.id} is missing a password field!`);
        return res.status(500).json({ message: 'User account data is incomplete. Please contact admin.' });
    }
    
    let match = false;
    try {
      match = await bcrypt.compare(password, hash);
    } catch (bErr) {
      console.error('Bcrypt error:', bErr);
      return res.status(500).json({ message: 'Encryption error. Please try again.' });
    }

    if (!match) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Incorrect password. Try again.' });
    }

    const name = (user.firstName && user.lastName) 
      ? user.firstName + ' ' + user.lastName 
      : (user.name || normalizedEmail.split('@')[0]);

    // Ensure we have a secret
    const secret = process.env.JWT_SECRET || 'eduachieve_default_secret_2024';

    const token = jwt.sign(
      { 
        id: user.id, 
        name,
        email: user.email, 
        role: user.role || 'student',
        department: user.department || 'CSE AI&ML',
        year: user.year || '',
        batch: user.batch || '',
        rollNumber: user.rollNumber || ''
      },
      secret,
      { expiresIn: '7d' }
    );

    console.log(`Login successful for ${normalizedEmail}`);
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name,
        email: user.email,
        role: user.role || 'student'
      }
    });
  } catch (error) {
    console.error('SERVER LOGIN ERROR:', error);
    return res.status(500).json({ 
      message: `Server error during login: ${error.message}. Please check server logs.`
    });
  }
});

module.exports = router;