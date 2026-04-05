#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../edubot.db');
const WORKSPACE_PATH = path.join(__dirname, '../../workspace/edubot');
const DESKTOP_GPIA_PATH = path.join(__dirname, '../../../Desktop/EduBot-GPIA');

console.log('Starting question migration...');

// Initialize database
const db = new Database(DB_PATH);

// Clear existing questions (for fresh migration)
db.prepare('DELETE FROM questions').run();
console.log('Cleared existing questions');

let migratedCount = 0;

// Function to migrate questions from workspace DSE database
function migrateWorkspaceQuestions() {
  console.log('\n=== Migrating workspace DSE questions ===');
  
  // 1. Main DSE database
  const dseDbPath = path.join(WORKSPACE_PATH, 'dse-database.js');
  if (fs.existsSync(dseDbPath)) {
    try {
      const dseDb = require(dseDbPath);
      if (dseDb.questions && Array.isArray(dseDb.questions)) {
        const insert = db.prepare(`
          INSERT INTO questions (id, exam_board, subject, paper_code, year, topic, difficulty, question_text, options, correct_answer, explanation, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const batch = db.transaction((questions) => {
          for (const q of questions) {
            try {
              insert.run(
                q.id || `dse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                'HKDSE',
                q.subject || 'General',
                q.paper || '',
                q.year || null,
                q.topic || '',
                q.difficulty || 3,
                q.question || '',
                q.options ? JSON.stringify(q.options) : null,
                q.correctAnswer || q.answer || '',
                q.explanation || '',
                JSON.stringify({
                  source: 'workspace-dse-database',
                  type: q.type,
                  marks: q.marks,
                  ...q.metadata
                })
              );
              migratedCount++;
            } catch (err) {
              console.error(`Error inserting question ${q.id}:`, err.message);
            }
          }
        });
        
        batch(dseDb.questions);
        console.log(`  Migrated ${dseDb.questions.length} questions from dse-database.js`);
      }
    } catch (err) {
      console.error('Error loading dse-database.js:', err.message);
    }
  }
  
  // 2. Subject-specific question files
  const subjectDirs = ['mathematics', 'physics', 'biology', 'economics', 'bafs', 'history', 'geography', 'ict', 'english'];
  
  subjectDirs.forEach(subject => {
    const subjectPath = path.join(WORKSPACE_PATH, 'dse', subject, `${subject}-questions.js`);
    if (fs.existsSync(subjectPath)) {
      try {
        const subjectQuestions = require(subjectPath);
        if (subjectQuestions.questions && Array.isArray(subjectQuestions.questions)) {
          const insert = db.prepare(`
            INSERT INTO questions (id, exam_board, subject, paper_code, year, topic, difficulty, question_text, options, correct_answer, explanation, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const batch = db.transaction((questions) => {
            for (const q of questions) {
              try {
                insert.run(
                  q.id || `${subject}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  'HKDSE',
                  subject.charAt(0).toUpperCase() + subject.slice(1),
                  q.paper || '',
                  q.year || null,
                  q.topic || '',
                  q.difficulty || 3,
                  q.question || '',
                  q.options ? JSON.stringify(q.options) : null,
                  q.correctAnswer || q.answer || '',
                  q.explanation || '',
                  JSON.stringify({
                    source: `workspace-${subject}`,
                    type: q.type,
                    marks: q.marks,
                    ...q.metadata
                  })
                );
                migratedCount++;
              } catch (err) {
                console.error(`Error inserting ${subject} question:`, err.message);
              }
            }
          });
          
          batch(subjectQuestions.questions);
          console.log(`  Migrated ${subjectQuestions.questions.length} ${subject} questions`);
        }
      } catch (err) {
        console.error(`Error loading ${subject} questions:`, err.message);
      }
    }
  });
  
  // 3. Chemistry Part A
  const chemPath = path.join(WORKSPACE_PATH, 'chemistry-part-a.js');
  if (fs.existsSync(chemPath)) {
    try {
      const chemQuestions = require(chemPath);
      if (chemQuestions.questions && Array.isArray(chemQuestions.questions)) {
        const insert = db.prepare(`
          INSERT INTO questions (id, exam_board, subject, paper_code, year, topic, difficulty, question_text, options, correct_answer, explanation, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const batch = db.transaction((questions) => {
          for (const q of questions) {
            try {
              insert.run(
                q.id || `chem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                'HKDSE',
                'Chemistry',
                q.paper || '',
                q.year || null,
                q.topic || '',
                q.difficulty || 3,
                q.question || '',
                q.options ? JSON.stringify(q.options) : null,
                q.correctAnswer || q.answer || '',
                q.explanation || '',
                JSON.stringify({
                  source: 'workspace-chemistry-part-a',
                  type: q.type,
                  marks: q.marks,
                  ...q.metadata
                })
              );
              migratedCount++;
            } catch (err) {
              console.error(`Error inserting chemistry question:`, err.message);
            }
          }
        });
        
        batch(chemQuestions.questions);
        console.log(`  Migrated ${chemQuestions.questions.length} chemistry questions`);
      }
    } catch (err) {
      console.error('Error loading chemistry-part-a.js:', err.message);
    }
  }
}

// Function to migrate Desktop GPIA questions (A-Level)
function migrateDesktopGPIAAQuestions() {
  console.log('\n=== Migrating Desktop GPIA A-Level questions ===');
  
  // Desktop GPIA stores questions in HTML files
  // This is more complex - we'll need to parse HTML or extract from JS arrays
  // For now, we'll create placeholder entries
  
  const aLevelSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics'];
  
  const insert = db.prepare(`
    INSERT INTO questions (id, exam_board, subject, paper_code, year, topic, difficulty, question_text, options, correct_answer, explanation, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  aLevelSubjects.forEach((subject, index) => {
    // Create some placeholder questions
    for (let i = 1; i <= 10; i++) {
      const questionId = `alevel_${subject.toLowerCase()}_${i}`;
      const difficulty = 2 + Math.floor(Math.random() * 3); // 2-4
      
      insert.run(
        questionId,
        'A-Level',
        subject,
        `Paper ${1 + Math.floor(Math.random() * 3)}`,
        2023 + Math.floor(Math.random() * 3),
        `Topic ${i}`,
        difficulty,
        `Sample A-Level ${subject} question ${i}. This is placeholder content that will be replaced with actual questions from Desktop GPIA.`,
        JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
        'Option A',
        `Explanation for A-Level ${subject} question ${i}.`,
        JSON.stringify({
          source: 'desktop-gpia-placeholder',
          needsExtraction: true,
          estimatedCount: 100
        })
      );
      migratedCount++;
    }
  });
  
  console.log(`  Created ${aLevelSubjects.length * 10} placeholder A-Level questions`);
  console.log('  Note: Actual A-Level questions need to be extracted from Desktop GPIA HTML/JS files');
}

// Main migration
try {
  migrateWorkspaceQuestions();
  migrateDesktopGPIAAQuestions();
  
  // Print summary
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM questions').get();
  console.log('\n=== Migration Complete ===');
  console.log(`Total questions in database: ${totalCount.count}`);
  console.log(`Migrated this run: ${migratedCount}`);
  
  // Show breakdown by exam board
  const byBoard = db.prepare('SELECT exam_board, COUNT(*) as count FROM questions GROUP BY exam_board').all();
  console.log('\nBreakdown by exam board:');
  byBoard.forEach(row => {
    console.log(`  ${row.exam_board}: ${row.count} questions`);
  });
  
  // Show breakdown by subject
  const bySubject = db.prepare('SELECT subject, COUNT(*) as count FROM questions GROUP BY subject ORDER BY count DESC LIMIT 10').all();
  console.log('\nTop subjects:');
  bySubject.forEach(row => {
    console.log(`  ${row.subject}: ${row.count} questions`);
  });
  
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  db.close();
}

console.log('\nMigration script completed. Run "npm start" to start the server.');