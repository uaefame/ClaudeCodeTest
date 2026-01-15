const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert PCM audio to WAV format for browser playback
function pcmToWav(pcmBase64, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const pcmData = Buffer.from(pcmBase64, 'base64');
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const wavBuffer = Buffer.alloc(fileSize);

  // RIFF header
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(fileSize - 8, 4);
  wavBuffer.write('WAVE', 8);

  // fmt subchunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavBuffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(wavBuffer, 44);

  return wavBuffer.toString('base64');
}

// Text model for content generation (Gemini 3 Pro)
const textModel = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

// Image model for infographic generation (Nano Banana Pro)
const imageModel = genAI.getGenerativeModel({ model: 'nano-banana-pro-preview' });

// TTS model for audio generation (Gemini 2.5 Pro TTS)
const ttsModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro-preview-tts',
  generationConfig: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: 'Kore'  // Natural, warm voice
        }
      }
    }
  }
});

async function generateReport(pdfData) {
  const prompt = `You are an educational content expert. Analyze the following document content and create a comprehensive study report.

The report should include:
1. **Overview**: A brief summary of the main topic
2. **Key Concepts**: List and explain the most important concepts
3. **Detailed Explanation**: In-depth explanation of each concept
4. **Important Terms**: Glossary of key terms with definitions
5. **Summary**: A concise recap of everything covered

Format the response in clean markdown.

Document Content:
${pdfData.text}`;

  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate report: ' + error.message);
  }
}

async function generateInteractiveLearning(pdfData) {
  const prompt = `You are an expert educational content designer. Based on the following document, create an interactive learning experience.

IMPORTANT: Create content that helps students LEARN the concepts first through examples and interaction, then TEST their understanding with practice questions. The practice questions should use NEW examples NOT from the original document.

Create a JSON response with exactly this structure:
{
  "title": "Learning Module Title",
  "introduction": "A brief, engaging introduction to what the student will learn",
  "concepts": [
    {
      "id": 1,
      "title": "Concept Name",
      "explanation": "Clear, simple explanation of the concept (2-3 sentences)",
      "keyPoint": "The single most important thing to remember",
      "examples": [
        {
          "title": "Example 1 Title",
          "scenario": "A real-world scenario or situation",
          "walkthrough": "Step-by-step explanation of how the concept applies",
          "interactive": {
            "type": "reveal",
            "question": "What do you think happens next?",
            "answer": "The revealed answer with explanation"
          }
        },
        {
          "title": "Example 2 Title",
          "scenario": "Another scenario",
          "walkthrough": "Explanation",
          "interactive": {
            "type": "choice",
            "question": "Which option is correct?",
            "options": ["Option A", "Option B", "Option C"],
            "correctIndex": 0,
            "explanation": "Why this is correct"
          }
        }
      ],
      "funFact": "An interesting or surprising fact related to this concept"
    }
  ],
  "practiceQuestions": [
    {
      "id": 1,
      "conceptId": 1,
      "type": "multiple_choice",
      "scenario": "A NEW scenario not from the document",
      "question": "Question about applying the concept",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct",
      "hint": "A helpful hint"
    },
    {
      "id": 2,
      "conceptId": 1,
      "type": "apply",
      "scenario": "A situation where student must apply knowledge",
      "question": "What would you do in this situation?",
      "correctApproach": "The correct approach explained",
      "commonMistakes": ["Common mistake 1", "Common mistake 2"]
    }
  ],
  "summary": "A brief recap of all concepts learned"
}

Generate 3-4 main concepts from the document. Each concept should have 4-5 diverse examples with interactive elements. Create 6-8 practice questions using COMPLETELY NEW scenarios (not from the original document) to truly test understanding.

Document Content:
${pdfData.text}`;

  try {
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Interactive learning generation error:', error);
    throw new Error('Failed to generate interactive learning content: ' + error.message);
  }
}

async function generateAudioScript(pdfData) {
  const prompt = `You are a friendly educational narrator. Create a spoken explanation script for the following document content.

The script should:
1. Start with a warm introduction
2. Explain concepts in a conversational, easy-to-understand way
3. Use analogies and examples where helpful
4. Include natural transitions between topics
5. End with a brief summary and encouragement

Write it as if you're speaking directly to a student. Keep it engaging and approximately 2-3 minutes when read aloud (about 400-500 words).

Do NOT include any stage directions, speaker labels, or formatting - just the text to be spoken.

Document Content:
${pdfData.text}`;

  try {
    // First generate the script text
    const scriptResult = await textModel.generateContent(prompt);
    const scriptResponse = await scriptResult.response;
    const script = scriptResponse.text();

    // Then generate audio using Gemini TTS
    try {
      const ttsPrompt = `Read the following educational script in a warm, engaging, and natural tone as if you're a friendly teacher explaining to a student:\n\n${script}`;

      const audioResult = await ttsModel.generateContent(ttsPrompt);
      const audioResponse = await audioResult.response;

      // Extract audio data from response
      if (audioResponse.candidates && audioResponse.candidates[0].content.parts) {
        for (const part of audioResponse.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
            // Convert PCM to WAV for browser compatibility
            const wavData = pcmToWav(part.inlineData.data, 24000, 1, 16);
            return {
              script: script,
              audio: {
                mimeType: 'audio/wav',
                data: wavData
              }
            };
          }
        }
      }

      // Fallback to script only if no audio generated
      console.log('No audio data in TTS response, falling back to script only');
      return { script: script, audio: null };
    } catch (ttsError) {
      console.log('TTS generation fallback:', ttsError.message);
      return { script: script, audio: null };
    }
  } catch (error) {
    console.error('Audio script generation error:', error);
    throw new Error('Failed to generate audio script: ' + error.message);
  }
}

async function generateInfographic(pdfData) {
  // Extract key points for infographic
  const summaryPrompt = `Summarize the following document into 5-7 key points that would work well in an infographic. Be concise - each point should be one short sentence.

Document Content:
${pdfData.text}`;

  try {
    // First, get key points
    const summaryResult = await textModel.generateContent(summaryPrompt);
    const keyPoints = (await summaryResult.response).text();

    // Generate infographic using Nano Banana Pro (Gemini image generation)
    const infographicPrompt = `Create a beautiful, educational infographic about the following topic.

Key points to visualize:
${keyPoints}

Style: Modern, clean, colorful educational infographic with icons, clear hierarchy, and easy-to-read text. Use a vertical layout suitable for students.`;

    try {
      const imageResult = await imageModel.generateContent(infographicPrompt);
      const response = await imageResult.response;

      // Check if image was generated
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return {
              type: 'image',
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data,
              keyPoints: keyPoints
            };
          }
        }
      }

      // Fallback: return key points as text-based infographic data
      return {
        type: 'text',
        keyPoints: keyPoints,
        message: 'Image generation not available, showing text summary'
      };
    } catch (imageError) {
      console.log('Image generation fallback:', imageError.message);
      // Return text-based infographic data as fallback
      return {
        type: 'text',
        keyPoints: keyPoints,
        message: 'Using text-based infographic (image generation requires API access)'
      };
    }
  } catch (error) {
    console.error('Infographic generation error:', error);
    throw new Error('Failed to generate infographic: ' + error.message);
  }
}

module.exports = {
  generateReport,
  generateInteractiveLearning,
  generateAudioScript,
  generateInfographic
};
