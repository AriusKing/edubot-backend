// Simplified server that works without database dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../Desktop/EduBot-GPIA/app')));

// Serve DSE practice platform
app.use('/dse', express.static(path.join(__dirname, '../../workspace/edubot/dse')));

// In-memory data stores
const questions = [];
const progress = [];

// Load questions from workspace if possible
try {
  // Try to load DSE database
  const dseDbPath = path.join(__dirname, '../../workspace/edubot/dse-database.js');
  if (fs.existsSync(dseDbPath)) {
    // Read and evaluate the JS file to extract questions
    const content = fs.readFileSync(dseDbPath, 'utf8');
    // Simple extraction - looking for questions array
    const match = content.match(/questions:\s*(\[[\s\S]*?\])/);
    if (match) {
      try {
        const questionsArray = eval(match[1]);
        if (Array.isArray(questionsArray)) {
          questions.push(...questionsArray.map(q => ({ ...q, exam_board: 'HKDSE' })));
          console.log(`Loaded ${questionsArray.length} questions from dse-database.js`);
        }
      } catch (err) {
        console.log('Could not parse questions from dse-database.js:', err.message);
      }
    }
  }
} catch (err) {
  console.log('Error loading questions:', err.message);
}

// Add some sample questions if none loaded
if (questions.length === 0) {
  questions.push(
    {
      id: 'sample_1',
      exam_board: 'HKDSE',
      subject: 'Mathematics',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correct_answer: '4',
      difficulty: 1,
      explanation: 'Basic arithmetic.'
    },
    {
      id: 'sample_2',
      exam_board: 'A-Level',
      subject: 'Physics',
      question: 'What is Newton\'s first law of motion?',
      options: [
        'F = ma',
        'An object at rest stays at rest',
        'For every action there is an equal and opposite reaction',
        'Energy cannot be created or destroyed'
      ],
      correct_answer: 'An object at rest stays at rest',
      difficulty: 2,
      explanation: 'Also known as the law of inertia.'
    }
  );
  console.log('Added sample questions');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'EduBot Super App (Simple Mode)',
    port: PORT,
    time: new Date().toISOString(),
    questions: questions.length,
    progress: progress.length
  });
});

app.get('/api/questions', (req, res) => {
  const { examBoard, subject, limit = 20 } = req.query;
  
  let filtered = questions;
  
  if (examBoard) {
    filtered = filtered.filter(q => q.exam_board === examBoard);
  }
  
  if (subject) {
    filtered = filtered.filter(q => 
      q.subject && q.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }
  
  filtered = filtered.slice(0, parseInt(limit));
  
  res.json({
    count: filtered.length,
    total: questions.length,
    questions: filtered
  });
});

app.post('/api/progress', (req, res) => {
  const record = req.body;
  record.id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  record.timestamp = new Date().toISOString();
  
  progress.push(record);
  
  // Keep only last 1000 records
  if (progress.length > 1000) {
    progress.splice(0, progress.length - 1000);
  }
  
  res.json({
    message: 'Progress recorded',
    id: record.id,
    timestamp: record.timestamp
  });
});

app.get('/api/progress', (req, res) => {
  const { userId = 'default', limit = 50 } = req.query;
  
  const userProgress = progress.filter(p => p.userId === userId);
  const recent = userProgress.slice(-parseInt(limit));
  
  const total = userProgress.length;
  const correct = userProgress.filter(p => p.correct).length;
  const accuracy = total > 0 ? (correct / total * 100).toFixed(1) : 0;
  
  res.json({
    userId,
    total,
    correct,
    accuracy: `${accuracy}%`,
    recent
  });
});

// Tutor endpoint (mock)
app.post('/api/tutor/ask', (req, res) => {
  const { question } = req.body;
  
  res.json({
    answer: `I understand you're asking: "${question}". As an AI tutor, I'd be happy to help! For this topic, I recommend reviewing the key concepts and practicing with similar questions.`,
    model: 'mock',
    source: 'mock-tutor'
  });
});

// Paper scanning endpoint
app.get('/api/papers', (req, res) => {
  // Mock response
  res.json({
    count: 2,
    papers: [
      {
        id: 'paper_1',
        examBoard: 'HKDSE',
        subject: 'Mathematics',
        year: 2024,
        filename: '2024_HKDSE_Math_Paper_1.pdf',
        size: 2048000
      },
      {
        id: 'paper_2',
        examBoard: 'A-Level',
        subject: 'Physics',
        year: 2023,
        filename: '2023_A-Level_Physics_Paper_2.pdf',
        size: 3072000
      }
    ]
  });
});

// Serve main dashboard
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Desktop/EduBot-GPIA/app/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EduBot Super App Backend running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`❓ Questions API: http://localhost:${PORT}/api/questions`);
  console.log(`📚 DSE Practice: http://localhost:${PORT}/dse/dse-practice.html`);
  console.log('\nNote: Running in simple mode without database.');
  console.log('To enable full features, install dependencies: npm install');
});