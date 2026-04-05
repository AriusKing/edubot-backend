const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Check if Ollama is available
async function checkOllama() {
  try {
    const { stdout } = await execPromise('ollama --version');
    console.log('Ollama detected:', stdout.trim());
    return true;
  } catch (err) {
    console.log('Ollama not detected:', err.message);
    return false;
  }
}

// Available models (local)
const AVAILABLE_MODELS = [
  'llama3.2:3b',
  'llama3.1:8b', 
  'qwen2.5:7b',
  'qwen3.5:latest',
  'deepseek-r1:14b'
];

// Mock responses for when Ollama is unavailable
const MOCK_RESPONSES = {
  'explain': `Let me explain this concept step by step. First, we need to understand the fundamental principle. In this case, the key idea is that energy is conserved in isolated systems. 

1. **Identify the known values**: We have mass = 5kg, initial velocity = 10m/s, final velocity = 0m/s.
2. **Apply the kinetic energy formula**: KE = ½ × m × v²
3. **Calculate initial KE**: KE_initial = ½ × 5 × 10² = 250 J
4. **Calculate final KE**: KE_final = ½ × 5 × 0² = 0 J
5. **Energy change**: ΔKE = KE_final - KE_initial = -250 J

The negative sign indicates energy loss, which is converted to other forms like heat or sound.`,
  
  'grade': `Based on the HKDSE marking scheme, this answer would receive **4/6 marks**.

**Strengths:**
- Correct identification of the main theme (2 marks)
- Appropriate use of textual evidence (1 mark)
- Clear structure with introduction and conclusion (1 mark)

**Areas for improvement:**
- Need to analyze the author's language techniques more deeply (missing 1 mark)
- Could provide more specific examples from the text (missing 1 mark)

**Suggestion for improvement:** Focus on analyzing how specific literary devices (metaphor, symbolism, imagery) contribute to the theme.`,
  
  'general': `That's an excellent question! In HKDSE Mathematics, this type of problem tests your understanding of quadratic functions and their graphs.

The key insight is that the discriminant (b² - 4ac) determines the number of real roots:
- If discriminant > 0: Two distinct real roots
- If discriminant = 0: One repeated real root  
- If discriminant < 0: No real roots (complex roots)

For your specific equation 2x² - 5x + 3 = 0:
a = 2, b = -5, c = 3
Discriminant = (-5)² - 4×2×3 = 25 - 24 = 1 > 0

Therefore, there are two distinct real roots. You can find them using the quadratic formula.`
};

// POST /api/tutor/ask - General tutoring question
router.post('/ask', async (req, res) => {
  const { question, context, model = 'llama3.2:3b' } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  
  const ollamaAvailable = await checkOllama();
  
  if (ollamaAvailable) {
    // Use Ollama API
    try {
      const prompt = `You are an expert HKDSE/A-Level/GCSE tutor. Answer the student's question clearly and helpfully.

Context: ${context || 'General academic question'}
Question: ${question}

Provide a step-by-step explanation suitable for a high school student preparing for exams:`;
      
      // Call Ollama via curl
      const { stdout } = await execPromise(`ollama run ${model} "${prompt.replace(/"/g, '\\"')}"`, {
        timeout: 30000 // 30 second timeout
      });
      
      res.json({
        answer: stdout.trim(),
        model,
        source: 'ollama'
      });
    } catch (err) {
      console.error('Ollama error:', err);
      // Fall back to mock response
      res.json({
        answer: MOCK_RESPONSES.general,
        model: 'mock',
        source: 'fallback',
        error: err.message
      });
    }
  } else {
    // Use mock response
    res.json({
      answer: MOCK_RESPONSES.general,
      model: 'mock',
      source: 'mock'
    });
  }
});

// POST /api/tutor/explain - Step-by-step explanation
router.post('/explain', async (req, res) => {
  const { concept, subject, difficulty = 'medium', model = 'llama3.2:3b' } = req.body;
  
  if (!concept) {
    return res.status(400).json({ error: 'Concept is required' });
  }
  
  const ollamaAvailable = await checkOllama();
  
  if (ollamaAvailable) {
    try {
      const prompt = `Explain the following ${subject || 'academic'} concept for a ${difficulty} level high school student: "${concept}"

Break it down into 3-5 clear steps with examples if appropriate:`;
      
      const { stdout } = await execPromise(`ollama run ${model} "${prompt.replace(/"/g, '\\"')}"`, {
        timeout: 30000
      });
      
      res.json({
        explanation: stdout.trim(),
        model,
        source: 'ollama'
      });
    } catch (err) {
      console.error('Ollama error:', err);
      res.json({
        explanation: MOCK_RESPONSES.explain,
        model: 'mock',
        source: 'fallback'
      });
    }
  } else {
    res.json({
      explanation: MOCK_RESPONSES.explain,
      model: 'mock',
      source: 'mock'
    });
  }
});

// POST /api/tutor/grade - Grade a student response
router.post('/grade', async (req, res) => {
  const { answer, question, subject, markingScheme = 'HKDSE', model = 'llama3.2:3b' } = req.body;
  
  if (!answer || !question) {
    return res.status(400).json({ error: 'Answer and question are required' });
  }
  
  const ollamaAvailable = await checkOllama();
  
  if (ollamaAvailable) {
    try {
      const prompt = `As an experienced ${subject || ''} teacher grading according to ${markingScheme} standards:

Question: ${question}

Student's Answer: ${answer}

Provide:
1. Overall score (e.g., 4/6)
2. Strengths of the answer
3. Areas for improvement
4. Specific suggestions to achieve higher marks

Format as a JSON object with keys: score, strengths, improvements, suggestions`;
      
      const { stdout } = await execPromise(`ollama run ${model} "${prompt.replace(/"/g, '\\"')}"`, {
        timeout: 30000
      });
      
      // Try to parse JSON, fallback to text
      try {
        const jsonResponse = JSON.parse(stdout.trim());
        res.json({
          ...jsonResponse,
          model,
          source: 'ollama'
        });
      } catch (e) {
        res.json({
          score: 'N/A',
          strengths: 'Answer shows understanding',
          improvements: 'Could provide more detail',
          suggestions: 'Include specific examples from the text',
          raw: stdout.trim(),
          model,
          source: 'ollama'
        });
      }
    } catch (err) {
      console.error('Ollama error:', err);
      res.json({
        ...JSON.parse(MOCK_RESPONSES.grade),
        model: 'mock',
        source: 'fallback'
      });
    }
  } else {
    res.json({
      ...JSON.parse(MOCK_RESPONSES.grade),
      model: 'mock',
      source: 'mock'
    });
  }
});

// GET /api/tutor/models - List available models
router.get('/models', async (req, res) => {
  const ollamaAvailable = await checkOllama();
  
  if (ollamaAvailable) {
    try {
      const { stdout } = await execPromise('ollama list', { timeout: 10000 });
      const models = stdout.split('\n')
        .filter(line => line.trim() && !line.includes('NAME'))
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            name: parts[0],
            size: parts[1],
            modified: parts.slice(2).join(' ')
          };
        });
      
      res.json({
        available: models,
        source: 'ollama'
      });
    } catch (err) {
      res.json({
        available: AVAILABLE_MODELS.map(name => ({ name, size: 'unknown', modified: 'unknown' })),
        source: 'default',
        error: err.message
      });
    }
  } else {
    res.json({
      available: AVAILABLE_MODELS.map(name => ({ name, size: 'unknown', modified: 'unknown' })),
      source: 'default'
    });
  }
});

module.exports = router;