const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Temporary storage (will be replaced with database)
let progressData = [];

// Load existing progress from workspace if available
try {
  const progressPath = path.join(__dirname, '../../../workspace/edubot/data/progress.json');
  if (fs.existsSync(progressPath)) {
    const progressJson = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    if (Array.isArray(progressJson)) {
      progressData = progressJson;
      console.log(`Loaded ${progressData.length} progress records from workspace`);
    }
  }
} catch (err) {
  console.log('Could not load progress data from workspace:', err.message);
}

// GET /api/progress - Get progress for user (simplified - single user for now)
router.get('/', (req, res) => {
  const { userId = 'default', limit = 100 } = req.query;
  
  // Filter by user (simplified - in real app would use authentication)
  const userProgress = progressData.filter(p => p.userId === userId);
  
  // Apply limit
  const limited = userProgress.slice(-parseInt(limit));
  
  // Calculate some basic stats
  const total = userProgress.length;
  const correct = userProgress.filter(p => p.correct).length;
  const accuracy = total > 0 ? (correct / total * 100).toFixed(1) : 0;
  
  // Group by subject
  const bySubject = {};
  userProgress.forEach(p => {
    if (p.subject) {
      if (!bySubject[p.subject]) {
        bySubject[p.subject] = { total: 0, correct: 0 };
      }
      bySubject[p.subject].total++;
      if (p.correct) bySubject[p.subject].correct++;
    }
  });
  
  // Calculate accuracy per subject
  Object.keys(bySubject).forEach(subject => {
    const stat = bySubject[subject];
    stat.accuracy = stat.total > 0 ? (stat.correct / stat.total * 100).toFixed(1) : 0;
  });
  
  res.json({
    userId,
    total,
    correct,
    accuracy: `${accuracy}%`,
    bySubject,
    recent: limited
  });
});

// POST /api/progress - Record progress
router.post('/', (req, res) => {
  const progress = req.body;
  
  // Add timestamp if not present
  if (!progress.timestamp) {
    progress.timestamp = new Date().toISOString();
  }
  
  // Add ID if not present
  if (!progress.id) {
    progress.id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Store in memory
  progressData.push(progress);
  
  // Also append to workspace progress file for compatibility
  try {
    const progressPath = path.join(__dirname, '../../../workspace/edubot/data/progress.json');
    const existing = fs.existsSync(progressPath) 
      ? JSON.parse(fs.readFileSync(progressPath, 'utf8')) 
      : [];
    
    existing.push(progress);
    fs.writeFileSync(progressPath, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.log('Could not save to workspace progress file:', err.message);
  }
  
  res.json({
    message: 'Progress recorded',
    id: progress.id,
    timestamp: progress.timestamp
  });
});

// GET /api/progress/stats - Get detailed statistics
router.get('/stats', (req, res) => {
  const { userId = 'default', days = 30 } = req.query;
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(days));
  
  const recentProgress = progressData.filter(p => 
    p.userId === userId && new Date(p.timestamp) > cutoff
  );
  
  // Calculate daily accuracy
  const dailyStats = {};
  recentProgress.forEach(p => {
    const date = p.timestamp.split('T')[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { total: 0, correct: 0 };
    }
    dailyStats[date].total++;
    if (p.correct) dailyStats[date].correct++;
  });
  
  // Convert to array
  const dailyArray = Object.keys(dailyStats).map(date => ({
    date,
    total: dailyStats[date].total,
    correct: dailyStats[date].correct,
    accuracy: dailyStats[date].total > 0 
      ? (dailyStats[date].correct / dailyStats[date].total * 100).toFixed(1)
      : 0
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  res.json({
    userId,
    days,
    totalRecords: recentProgress.length,
    dailyStats: dailyArray
  });
});

module.exports = router;