const geminiService = require('./geminiService');

/**
 * Content Generator Service
 * Orchestrates the generation of all learning content from PDF data
 */

async function generateAllContent(pdfData, progressCallback = null) {
  const results = {
    report: null,
    interactiveLearning: null,
    audioScript: null,
    infographic: null
  };

  const updateProgress = (step, progress) => {
    if (progressCallback) {
      progressCallback(step, progress);
    }
  };

  // Generate report
  updateProgress('Generating detailed report...', 25);
  results.report = await geminiService.generateReport(pdfData);

  // Generate interactive learning content
  updateProgress('Creating interactive learning experience...', 45);
  results.interactiveLearning = await geminiService.generateInteractiveLearning(pdfData);

  // Generate audio script
  updateProgress('Creating audio explanation...', 65);
  results.audioScript = await geminiService.generateAudioScript(pdfData);

  // Generate infographic
  updateProgress('Generating infographic...', 85);
  results.infographic = await geminiService.generateInfographic(pdfData);

  return results;
}

async function generateReport(pdfData) {
  return await geminiService.generateReport(pdfData);
}

async function generateInteractiveLearning(pdfData) {
  return await geminiService.generateInteractiveLearning(pdfData);
}

async function generateAudioScript(pdfData) {
  return await geminiService.generateAudioScript(pdfData);
}

async function generateInfographic(pdfData) {
  return await geminiService.generateInfographic(pdfData);
}

module.exports = {
  generateAllContent,
  generateReport,
  generateInteractiveLearning,
  generateAudioScript,
  generateInfographic
};
