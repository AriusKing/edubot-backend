const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Paths to PDF repositories
const PDF_PATHS = [
  path.join(__dirname, '../../../Desktop/EduBot-GPIA/papers'),
  path.join(__dirname, '../../../Desktop/EduBot-GPIA.backup-20260317/papers'),
  path.join(__dirname, '../../../workspace/edubot-portable-gpia/papers'),
  path.join(__dirname, '../../../workspace/edubot-portable-clean/papers')
];

// Cache of paper metadata
let paperCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Scan for PDFs and build metadata
function scanPapers() {
  const now = Date.now();
  if (paperCache && (now - lastCacheTime < CACHE_TTL)) {
    return paperCache;
  }
  
  console.log('Scanning for PDF papers...');
  const papers = [];
  
  PDF_PATHS.forEach(pdfPath => {
    if (!fs.existsSync(pdfPath)) {
      console.log(`PDF path does not exist: ${pdfPath}`);
      return;
    }
    
    try {
      // Walk directory recursively
      function walkDir(dir, basePath = pdfPath) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          const relativePath = path.relative(basePath, fullPath);
          
          if (item.isDirectory()) {
            walkDir(fullPath, basePath);
          } else if (item.name.toLowerCase().endsWith('.pdf')) {
            // Parse filename for metadata
            const filename = item.name;
            const stats = fs.statSync(fullPath);
            
            // Extract metadata from filename (common patterns)
            let examBoard = 'Unknown';
            let subject = 'Unknown';
            let year = null;
            let paperCode = '';
            
            // Common patterns
            if (filename.includes('HKDSE')) {
              examBoard = 'HKDSE';
            } else if (filename.includes('A-Level') || filename.includes('ALevel')) {
              examBoard = 'A-Level';
            } else if (filename.includes('GCSE')) {
              examBoard = 'GCSE';
            } else if (filename.includes('IGCSE')) {
              examBoard = 'IGCSE';
            } else if (filename.includes('AS-Level')) {
              examBoard = 'AS-Level';
            }
            
            // Try to extract year (4-digit number)
            const yearMatch = filename.match(/(20\d{2})/);
            if (yearMatch) {
              year = parseInt(yearMatch[1]);
            }
            
            // Try to extract subject
            const subjectKeywords = {
              'math': 'Mathematics',
              'physics': 'Physics',
              'chemistry': 'Chemistry',
              'biology': 'Biology',
              'english': 'English',
              'history': 'History',
              'geography': 'Geography',
              'economics': 'Economics',
              'bafs': 'BAFS',
              'ict': 'ICT',
              'chinese': 'Chinese',
              'liberal': 'Liberal Studies'
            };
            
            for (const [key, subjectName] of Object.entries(subjectKeywords)) {
              if (filename.toLowerCase().includes(key)) {
                subject = subjectName;
                break;
              }
            }
            
            // Paper code (e.g., Paper 1, Paper 2)
            const paperMatch = filename.match(/paper[\s\-]*(\d+)/i);
            if (paperMatch) {
              paperCode = `Paper ${paperMatch[1]}`;
            }
            
            papers.push({
              id: `paper_${papers.length + 1}`,
              filename,
              path: relativePath,
              fullPath: fullPath,
              examBoard,
              subject,
              year,
              paperCode,
              size: stats.size,
              lastModified: stats.mtime.toISOString(),
              source: path.basename(pdfPath)
            });
          }
        }
      }
      
      walkDir(pdfPath);
    } catch (err) {
      console.error(`Error scanning ${pdfPath}:`, err.message);
    }
  });
  
  console.log(`Found ${papers.length} PDF papers`);
  paperCache = papers;
  lastCacheTime = now;
  
  return papers;
}

// GET /api/papers - List papers with filters
router.get('/', (req, res) => {
  const { examBoard, subject, year, limit = 100, offset = 0 } = req.query;
  
  const papers = scanPapers();
  let filtered = papers;
  
  if (examBoard) {
    filtered = filtered.filter(p => 
      p.examBoard.toLowerCase().includes(examBoard.toLowerCase())
    );
  }
  
  if (subject) {
    filtered = filtered.filter(p => 
      p.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }
  
  if (year) {
    const yearNum = parseInt(year);
    filtered = filtered.filter(p => p.year === yearNum);
  }
  
  // Apply pagination
  const total = filtered.length;
  const start = parseInt(offset);
  const end = start + parseInt(limit);
  const paginated = filtered.slice(start, end);
  
  res.json({
    count: paginated.length,
    total,
    offset: start,
    limit: parseInt(limit),
    papers: paginated
  });
});

// GET /api/papers/stats - Get statistics
router.get('/stats', (req, res) => {
  const papers = scanPapers();
  
  // Group by exam board
  const byExamBoard = {};
  papers.forEach(p => {
    if (!byExamBoard[p.examBoard]) {
      byExamBoard[p.examBoard] = 0;
    }
    byExamBoard[p.examBoard]++;
  });
  
  // Group by subject
  const bySubject = {};
  papers.forEach(p => {
    if (!bySubject[p.subject]) {
      bySubject[p.subject] = 0;
    }
    bySubject[p.subject]++;
  });
  
  // Group by year
  const byYear = {};
  papers.forEach(p => {
    if (p.year) {
      if (!byYear[p.year]) {
        byYear[p.year] = 0;
      }
      byYear[p.year]++;
    }
  });
  
  // Total size
  const totalSize = papers.reduce((sum, p) => sum + p.size, 0);
  
  res.json({
    total: papers.length,
    totalSize: `${(totalSize / (1024 * 1024)).toFixed(1)} MB`,
    byExamBoard,
    bySubject,
    byYear: Object.keys(byYear).sort().map(year => ({
      year: parseInt(year),
      count: byYear[year]
    })),
    sources: [...new Set(papers.map(p => p.source))]
  });
});

// GET /api/papers/:id/pdf - Serve PDF file
router.get('/:id/pdf', (req, res) => {
  const papers = scanPapers();
  const paper = papers.find(p => p.id === req.params.id);
  
  if (!paper) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  
  if (!fs.existsSync(paper.fullPath)) {
    return res.status(404).json({ error: 'PDF file not found on disk' });
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${paper.filename}"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(paper.fullPath);
  fileStream.pipe(res);
});

// GET /api/papers/:id/info - Get paper metadata
router.get('/:id/info', (req, res) => {
  const papers = scanPapers();
  const paper = papers.find(p => p.id === req.params.id);
  
  if (!paper) {
    return res.status(404).json({ error: 'Paper not found' });
  }
  
  // Don't include fullPath in response for security
  const { fullPath, ...safeInfo } = paper;
  res.json(safeInfo);
});

module.exports = router;