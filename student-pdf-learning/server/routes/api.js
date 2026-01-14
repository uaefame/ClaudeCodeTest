const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParser = require('../services/pdfParser');
const contentGenerator = require('../services/contentGenerator');

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

// Process a previously uploaded PDF (separate from upload)
router.post('/process', async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const job = processingResults.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'processing') {
      return res.status(400).json({ error: 'Job is already being processed' });
    }

    if (job.status === 'completed') {
      return res.status(400).json({ error: 'Job has already been processed' });
    }

    if (!job.filePath || !fs.existsSync(job.filePath)) {
      return res.status(400).json({ error: 'PDF file not found. Please upload again.' });
    }

    // Reset job status and start processing
    job.status = 'processing';
    job.progress = 0;
    job.error = null;
    processingResults.set(jobId, { ...job });

    // Start async processing
    processDocument(jobId, job.filePath);

    res.json({
      success: true,
      jobId,
      message: 'Processing started.'
    });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ error: error.message });
  }
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

    // Step 2-5: Generate all content using contentGenerator service
    const progressCallback = (step, progress) => {
      job.progress = progress;
      job.step = step;
      processingResults.set(jobId, { ...job });
    };

    const results = await contentGenerator.generateAllContent(pdfText, progressCallback);

    // Complete
    job.status = 'completed';
    job.progress = 100;
    job.step = 'Complete!';
    job.results = results;
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
