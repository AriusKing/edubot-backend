// Test server without SQLite dependency
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../Desktop/EduBot-GPIA/app')));

// Simple in-memory question store
const questions = [
  {
    id: 'test_1',
    exam_board: 'HKDSE',
    subject: 'Mathematics',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct_answer: '4',
    difficulty: 1
  },
  {
    id: 'test_2', 
    exam_board: 'HKDSE',
    subject: 'English',
    question: 'What is the past tense of "go"?',
    options: ['goed', 'went', 'gone', 'going'],
    correct_answer: 'went',
    difficulty: 2
  }
];

// Simple API endpoints
app.get('/api/questions', (req, res) => {
  res.json({
    count: questions.length,
    questions
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    server: 'EduBot Super App Test',
    port: PORT,
    time: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Desktop/EduBot-GPIA/app/index.html'));
});

app.listen(PORT, () => {
  console.log(`EduBot Super App Test Server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`Questions API: http://localhost:${PORT}/api/questions`);
});