import { useState } from 'react'
import FileUpload from './components/FileUpload'
import TabContainer from './components/TabContainer'

function App() {
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ percent: 0, step: '' })

  const handleProcessingComplete = (data) => {
    setResults(data)
    setIsProcessing(false)
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setResults(null)
  }

  const handleProgressUpdate = (progressData) => {
    setProgress(progressData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">
            Student PDF Learning Platform
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Upload your homework or textbook chapter to generate learning materials
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!results && (
          <FileUpload
            onProcessingStart={handleProcessingStart}
            onProcessingComplete={handleProcessingComplete}
            onProgressUpdate={handleProgressUpdate}
            isProcessing={isProcessing}
            progress={progress}
          />
        )}

        {results && (
          <div className="space-y-4">
            <button
              onClick={() => setResults(null)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Upload another PDF
            </button>
            <TabContainer results={results} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          Powered by Google Gemini AI
        </div>
      </footer>
    </div>
  )
}

export default App
