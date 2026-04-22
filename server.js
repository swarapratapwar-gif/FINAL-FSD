const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./backend/routes/auth');
const projectRoutes = require('./backend/routes/projects');

const app = express();
const APP_NAME = 'eduachieve-integrated';

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    app: APP_NAME,
    status: 'ok'
  });
});

app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Server error. Try again.',
    error: process.env.NODE_ENV === 'production' ? undefined : String(err)
  });
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
  console.log(`${APP_NAME} running on http://localhost:${PORT}`);
});