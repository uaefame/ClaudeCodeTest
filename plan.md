# Student PDF Learning Platform - Implementation Plan

## Overview
A web application that takes student PDFs (homework/book chapters) and generates four learning outputs:
1. **Infographic** - Generated using Nano Banana Pro (Google Gemini)
2. **Audio Explanation** - Text-to-speech of concept explanation
3. **Interactive Learning** - Quizzes and practice exercises
4. **Report** - Detailed written explanation

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI Processing**: Google Gemini API (for PDF analysis + Nano Banana Pro for infographics)
- **Audio**: Browser Web Speech API (free, no API key needed)
- **Styling**: Tailwind CSS
- **Containerization**: Docker + Docker Compose (for easy transfer/deployment)

## Project Structure
```
student-pdf-learning/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── TabContainer.jsx
│   │   │   ├── InfographicTab.jsx
│   │   │   ├── AudioTab.jsx
│   │   │   ├── InteractiveTab.jsx
│   │   │   └── ReportTab.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── server/                 # Express backend
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   ├── pdfParser.js
│   │   ├── geminiService.js
│   │   └── contentGenerator.js
│   ├── index.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Orchestrate both services
├── .env.example            # Environment variables template
└── README.md
```

## Implementation Steps

### Step 1: Project Setup
- Initialize React + Vite frontend
- Initialize Express backend
- Install dependencies (pdf-parse, @google/generative-ai, cors, multer)
- Create Dockerfiles for both client and server
- Create docker-compose.yml to orchestrate services

### Step 2: Backend - PDF Processing
- Create file upload endpoint with Multer
- Parse PDF text using pdf-parse library
- Send extracted text to Gemini for analysis

### Step 3: Backend - Gemini Integration
- Connect to Google Gemini API
- Create prompts for:
  - Content summarization (for report)
  - Quiz generation (for interactive tab)
  - Infographic generation via Nano Banana Pro
  - Audio script generation

### Step 4: Frontend - File Upload
- Create drag-and-drop PDF upload component
- Show upload progress and processing status

### Step 5: Frontend - Tab System
- Build 4-tab interface
- **Tab 1 (Infographic)**: Display generated infographic image
- **Tab 2 (Audio)**: Audio player with Web Speech API controls
- **Tab 3 (Interactive)**: Quiz component with multiple choice, practice problems
- **Tab 4 (Report)**: Formatted markdown/HTML report display

### Step 6: Interactive Learning Features
- Multiple choice quiz component
- Fill-in-the-blank exercises
- Score tracking
- Hint system

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload PDF file |
| `/api/process` | POST | Process PDF and generate all content |
| `/api/status/:id` | GET | Check processing status |

## Environment Variables Required
```
GEMINI_API_KEY=your_google_gemini_api_key
```

## Verification Plan
1. Copy `.env.example` to `.env` and add your Gemini API key
2. Run `docker-compose up --build` to start both services
3. Open http://localhost:3000 in browser
4. Upload a sample PDF
5. Verify all 4 tabs display correct content
6. Test quiz interactions
7. Test audio playback

## Docker Commands
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Transfer to Another Machine
1. Copy the entire `student-pdf-learning` folder
2. Create `.env` file with your Gemini API key
3. Run `docker-compose up --build`

## Notes
- Nano Banana Pro is accessed through the Gemini API's image generation capabilities
- Web Speech API is built into browsers - no external service needed
- Processing may take 30-60 seconds depending on PDF size
