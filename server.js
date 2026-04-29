const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./backend/routes/auth');
const projectRoutes = require('./backend/routes/projects');
const store = require('./backend/store');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await store.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'EduAchieve' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Serve frontend — homepage always first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'frontend')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Server error. Try again.',
    error: process.env.NODE_ENV === 'production' ? undefined : String(err)
  });
});

const PORT = process.env.PORT || 5055;

store.initializeAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 EduAchieve running at http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});