# Student PDF Learning Platform

A web application that takes student PDFs (homework/book chapters) and generates four learning outputs:

1. **Infographic** - Visual summary generated using Google Gemini
2. **Audio Explanation** - Text-to-speech of concept explanation using Web Speech API
3. **Interactive Learning** - Quizzes and practice exercises
4. **Report** - Detailed written explanation

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI Processing**: Google Gemini API
- **Audio**: Browser Web Speech API (free, no API key needed)
- **Styling**: Tailwind CSS
- **Containerization**: Docker + Docker Compose

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
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Google Gemini API key

### Setup

1. Clone the repository

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your Gemini API key to `.env`:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. Build and start all services:
   ```bash
   docker-compose up --build
   ```

5. Open http://localhost:3000 in your browser

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload PDF file and start processing |
| `/api/process` | POST | Process a previously uploaded PDF |
| `/api/status/:id` | GET | Check processing status and get results |

### Upload Endpoint

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "pdf=@your-file.pdf"
```

Response:
```json
{
  "success": true,
  "jobId": "uuid-string",
  "message": "PDF uploaded successfully. Processing started."
}
```

### Process Endpoint

```bash
curl -X POST http://localhost:5000/api/process \
  -H "Content-Type: application/json" \
  -d '{"jobId": "uuid-string"}'
```

### Status Endpoint

```bash
curl http://localhost:5000/api/status/{jobId}
```

Response (when complete):
```json
{
  "status": "completed",
  "progress": 100,
  "results": {
    "report": "...",
    "quiz": {...},
    "audioScript": "...",
    "infographic": {...}
  }
}
```

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

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
```

## Development

### Running without Docker

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Features

### Infographic Tab
- Displays AI-generated visual summary
- Falls back to text-based key points if image generation is unavailable
- Download option for generated infographics

### Audio Tab
- Text-to-speech using browser's Web Speech API
- Play/pause/stop controls
- Adjustable playback speed
- Voice selection from available system voices
- Progress indicator

### Interactive Tab
- Multiple choice questions
- True/false questions
- Fill-in-the-blank exercises
- Hint system for each question
- Score tracking with detailed results
- Explanations for correct answers

### Report Tab
- Comprehensive study report
- Markdown formatted content
- Key concepts and definitions
- Detailed explanations

## Transfer to Another Machine

1. Copy the entire `student-pdf-learning` folder
2. Create `.env` file with your Gemini API key
3. Run `docker-compose up --build`

## Notes

- Processing may take 30-60 seconds depending on PDF size
- Web Speech API is built into modern browsers - no external service needed
- Maximum file upload size is 10MB
