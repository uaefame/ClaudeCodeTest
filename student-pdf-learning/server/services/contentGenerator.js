const geminiService = require('./geminiService');

/**
 * Content Generator Service
 * Orchestrates the generation of all learning content from PDF data
 */

async function generateAllContent(pdfData, progressCallback = null, options = {}) {
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

  // Get selected content types (default to all if not specified)
  const contentTypes = options.contentTypes || ['visual', 'audio', 'readwrite', 'kinesthetic'];

  // Calculate progress steps based on selected content types
  const totalSteps = contentTypes.length;
  let currentStep = 0;

  // Generate report (readwrite)
  if (contentTypes.includes('readwrite')) {
    currentStep++;
    updateProgress('Generating detailed report...', Math.round((currentStep / totalSteps) * 80) + 10);
    results.report = await geminiService.generateReport(pdfData, options);
  }

  // Generate interactive learning content (kinesthetic)
  if (contentTypes.includes('kinesthetic')) {
    currentStep++;
    updateProgress('Creating interactive learning experience...', Math.round((currentStep / totalSteps) * 80) + 10);
    results.interactiveLearning = await geminiService.generateInteractiveLearning(pdfData, options);
  }

  // Generate audio script (audio)
  if (contentTypes.includes('audio')) {
    currentStep++;
    updateProgress('Creating audio explanation...', Math.round((currentStep / totalSteps) * 80) + 10);
    results.audioScript = await geminiService.generateAudioScript(pdfData, options);
  }

  // Generate infographic (visual)
  if (contentTypes.includes('visual')) {
    currentStep++;
    updateProgress('Generating infographic...', Math.round((currentStep / totalSteps) * 80) + 10);
    results.infographic = await geminiService.generateInfographic(pdfData, options);
  }

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
