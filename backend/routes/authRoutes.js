const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('✅ authRoutes.js loading...');

// ===================================
// ROUTE 1: REGISTER - POST /api/auth/register
// ===================================
router.post('/register', async (req, res) => {

  try {
    console.log('📝 Register route called');
    console.log('Request body:', req.body);
    
    // 1. Get data from request body
    const { name, email, password } = req.body;
    console.log('Extracted data:', { name, email, password });

    // 2. Check all fields are filled
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please fill all fields' 
      });
    }

    // 3. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered. Please login.' 
      });
    }

    // 4. Hash the password (never store plain passwords!)
    // 10 = "salt rounds" — how strong the encryption is
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // 5. Create new user in database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });
    console.log('User created:', newUser._id);

    // 6. Create a JWT token for auto-login after register
    const token = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }  // token expires in 7 days
    );

    // 7. Send success response
    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});


// ===================================
// ROUTE 2: LOGIN - POST /api/auth/login
// ===================================
router.post('/login', async (req, res) => {

  try {
    // 1. Get email and password from request
    const { email, password } = req.body;

    // 2. Check fields are filled
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please enter email and password' 
      });
    }

    // 3. Find user by email in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'No account found with this email.' 
      });
    }

    // 4. Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Incorrect password. Try again.' 
      });
    }

    // 5. Create JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Send success response
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});

module.exports = router;