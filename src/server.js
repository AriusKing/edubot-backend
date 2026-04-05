const express = require('express');
const path = require('path');
const cors = require('cors');

// Import routes
const questionRoutes = require('./routes/questionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const paperRoutes = require('./routes/paperRoutes');

// Import database initialization
const { initDatabase } = require('../db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from Desktop GPIA UI
app.use(express.static(path.join(__dirname, '../../Desktop/EduBot-GPIA/app')));
// Also serve DSE practice platform
app.use('/dse', express.static(path.join(__dirname, '../../workspace/edubot/dse')));

// API Routes
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/papers', paperRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to main dashboard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Desktop/EduBot-GPIA/app/index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`EduBot Super App backend running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/health`);
    console.log(`DSE Practice: http://localhost:${PORT}/dse/dse-practice.html`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;