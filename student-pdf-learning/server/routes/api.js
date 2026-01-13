const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParser = require('../services/pdfParser');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Store processing results in memory (use Redis/DB in production)
const processingResults = new Map();

// Upload and process PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const jobId = uuidv4();
    const filePath = req.file.path;

    // Initialize job status
    processingResults.set(jobId, {
      status: 'processing',
      progress: 0,
      filePath,
      fileName: req.file.originalname
    });

    // Start async processing
    processDocument(jobId, filePath);

    res.json({
      success: true,
      jobId,
      message: 'PDF uploaded successfully. Processing started.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get processing status and results
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const result = processingResults.get(jobId);

  if (!result) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(result);
});

// Process document asynchronously
async function processDocument(jobId, filePath) {
  try {
    const job = processingResults.get(jobId);

    // Step 1: Extract text from PDF
    job.progress = 10;
    job.step = 'Extracting text from PDF...';
    processingResults.set(jobId, { ...job });

    const pdfText = await pdfParser.extractText(filePath);

    // Step 2: Generate report/summary
    job.progress = 25;
    job.step = 'Generating detailed report...';
    processingResults.set(jobId, { ...job });

    const report = await geminiService.generateReport(pdfText);

    // Step 3: Generate quiz questions
    job.progress = 45;
    job.step = 'Creating quiz questions...';
    processingResults.set(jobId, { ...job });

    const quiz = await geminiService.generateQuiz(pdfText);

    // Step 4: Generate audio script
    job.progress = 65;
    job.step = 'Creating audio explanation...';
    processingResults.set(jobId, { ...job });

    const audioScript = await geminiService.generateAudioScript(pdfText);

    // Step 5: Generate infographic
    job.progress = 85;
    job.step = 'Generating infographic...';
    processingResults.set(jobId, { ...job });

    const infographic = await geminiService.generateInfographic(pdfText);

    // Complete
    job.status = 'completed';
    job.progress = 100;
    job.step = 'Complete!';
    job.results = {
      report,
      quiz,
      audioScript,
      infographic
    };
    processingResults.set(jobId, { ...job });

  } catch (error) {
    console.error('Processing error:', error);
    const job = processingResults.get(jobId);
    job.status = 'error';
    job.error = error.message;
    processingResults.set(jobId, { ...job });
  }
}

module.exports = router;
