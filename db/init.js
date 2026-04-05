const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../edubot.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function initDatabase() {
  const db = new Database(DB_PATH);
  
  // Enable foreign keys and other pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  // Create tables
  db.exec(`
    -- Users table (simple local auth)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      role TEXT DEFAULT 'student', -- student, teacher, admin
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      settings TEXT DEFAULT '{}'
    );
    
    -- Questions table (unified schema)
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_board TEXT NOT NULL, -- HKDSE, A-Level, GCSE, IGCSE, AS-Level
      subject TEXT NOT NULL,
      paper_code TEXT,
      year INTEGER,
      topic TEXT,
      difficulty INTEGER, -- 1-5
      question_text TEXT NOT NULL,
      options TEXT, -- JSON array for MC questions
      correct_answer TEXT,
      explanation TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Papers table (PDF metadata)
    CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      exam_board TEXT NOT NULL,
      subject TEXT NOT NULL,
      year INTEGER,
      paper_code TEXT,
      pdf_path TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Progress tracking
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      question_id TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      correct BOOLEAN,
      time_spent INTEGER, -- milliseconds
      confidence REAL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
    
    -- Classes (for teacher dashboard)
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER,
      name TEXT NOT NULL,
      subject TEXT,
      join_code TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    );
    
    -- Class membership
    CREATE TABLE IF NOT EXISTS class_membership (
      class_id INTEGER,
      student_id INTEGER,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (class_id, student_id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    );
  `);
  
  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_exam_board ON questions(exam_board);
    CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
    CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_question_id ON progress(question_id);
  `);
  
  console.log('Database initialized successfully');
  db.close();
  
  return Promise.resolve();
}

module.exports = { initDatabase, DB_PATH };