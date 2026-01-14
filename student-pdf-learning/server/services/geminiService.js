const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Text model for content generation
const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Image model for infographic generation (Nano Banana Pro)
const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

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

async function generateQuiz(pdfData) {
  const prompt = `You are an educational quiz creator. Based on the following document content, create an interactive quiz to test understanding.

Create a JSON response with exactly this structure:
{
  "title": "Quiz title based on the content",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct",
      "hint": "A helpful hint"
    },
    {
      "id": 2,
      "type": "fill_blank",
      "question": "Complete the sentence: The ___ is important because...",
      "answer": "correct word",
      "explanation": "Why this is the answer",
      "hint": "A helpful hint"
    },
    {
      "id": 3,
      "type": "true_false",
      "question": "Statement to evaluate",
      "correctAnswer": true,
      "explanation": "Why this is true/false",
      "hint": "A helpful hint"
    }
  ]
}

Generate 8-10 varied questions covering the main concepts. Include a mix of multiple choice (5-6), fill in the blank (2-3), and true/false (1-2) questions.

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
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz: ' + error.message);
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
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
  generateQuiz,
  generateAudioScript,
  generateInfographic
};
