const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Temporary: load questions from existing DSE database
// This will be replaced with database queries after migration

// Load workspace DSE questions
const workspaceEdubotPath = path.join(__dirname, '../../../workspace/edubot');
let dseQuestions = [];

try {
  // Try to load the main DSE database
  const dseDatabase = require(path.join(workspaceEdubotPath, 'dse-database.js'));
  if (dseDatabase && dseDatabase.questions) {
    dseQuestions = dseDatabase.questions.map(q => ({
      ...q,
      exam_board: 'HKDSE'
    }));
    console.log(`Loaded ${dseQuestions.length} DSE questions from workspace`);
  }
} catch (err) {
  console.log('Could not load DSE database from workspace, using fallback');
}

// Load subject-specific question files
const subjectDirs = ['mathematics', 'physics', 'biology', 'economics', 'bafs', 'history', 'geography', 'ict', 'english'];
subjectDirs.forEach(subject => {
  const subjectPath = path.join(workspaceEdubotPath, 'dse', subject, `${subject}-questions.js`);
  if (fs.existsSync(subjectPath)) {
    try {
      const subjectQuestions = require(subjectPath);
      if (subjectQuestions && subjectQuestions.questions) {
        dseQuestions.push(...subjectQuestions.questions.map(q => ({
          ...q,
          exam_board: 'HKDSE',
          subject: subject.charAt(0).toUpperCase() + subject.slice(1)
        })));
        console.log(`Loaded ${subjectQuestions.questions.length} ${subject} questions`);
      }
    } catch (err) {
      // Ignore errors
    }
  }
});

// Load Desktop GPIA A-Level questions if available
let alevelQuestions = [];
try {
  const gpiaPath = path.join(__dirname, '../../../Desktop/EduBot-GPIA/app');
  // Note: Desktop GPIA questions are in JS arrays within HTML files
  // This needs proper extraction - for now placeholder
  alevelQuestions = []; // TODO: Extract from GPIA
} catch (err) {
  console.log('Could not load A-Level questions from Desktop GPIA');
}

// Combine all questions
const allQuestions = [...dseQuestions, ...alevelQuestions];

// GET /api/questions - List questions with filters
router.get('/', (req, res) => {
  const { examBoard, subject, difficulty, topic, limit = 50 } = req.query;
  
  let filtered = allQuestions;
  
  if (examBoard) {
    filtered = filtered.filter(q => q.exam_board === examBoard);
  }
  
  if (subject) {
    filtered = filtered.filter(q => 
      q.subject.toLowerCase().includes(subject.toLowerCase()) ||
      (q.metadata && q.metadata.subject && q.metadata.subject.toLowerCase().includes(subject.toLowerCase()))
    );
  }
  
  if (difficulty) {
    const diffNum = parseInt(difficulty);
    filtered = filtered.filter(q => q.difficulty === diffNum);
  }
  
  if (topic) {
    filtered = filtered.filter(q => 
      q.topic && q.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }
  
  // Apply limit
  filtered = filtered.slice(0, parseInt(limit));
  
  res.json({
    count: filtered.length,
    total: allQuestions.length,
    questions: filtered
  });
});

// GET /api/questions/:id - Get single question
router.get('/:id', (req, res) => {
  const question = allQuestions.find(q => q.id === req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json(question);
});

// POST /api/questions - Create new question (teacher/admin)
router.post('/', (req, res) => {
  // For now, just acknowledge - will implement database persistence later
  const newQuestion = req.body;
  console.log('Received new question:', newQuestion);
  res.json({
    message: 'Question received (will be stored in database after migration)',
    id: newQuestion.id || `temp_${Date.now()}`
  });
});

module.exports = router;