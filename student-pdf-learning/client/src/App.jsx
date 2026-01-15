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
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Header */}
      <header className="bg-navy-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            {/* Masari Logo - Four VARK paths */}
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-8 bg-visual rounded-full transform -rotate-12"></div>
              <div className="w-2 h-8 bg-audio rounded-full transform -rotate-4"></div>
              <div className="w-2 h-8 bg-readwrite rounded-full transform rotate-4"></div>
              <div className="w-2 h-8 bg-kinesthetic rounded-full transform rotate-12"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
                Masari
              </h1>
              <p className="text-navy-300 text-sm font-body">
                Learn Your Way
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* VARK Color Bar */}
      <div className="h-1 flex">
        <div className="flex-1 bg-visual"></div>
        <div className="flex-1 bg-audio"></div>
        <div className="flex-1 bg-readwrite"></div>
        <div className="flex-1 bg-kinesthetic"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {!results && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-navy-800 font-heading mb-2">
                Personalized Learning, Your Way
              </h2>
              <p className="text-navy-500 font-body max-w-2xl mx-auto">
                Upload your homework or textbook chapter to generate learning materials
                tailored to your VARK learning style
              </p>
            </div>
            <FileUpload
              onProcessingStart={handleProcessingStart}
              onProcessingComplete={handleProcessingComplete}
              onProgressUpdate={handleProgressUpdate}
              isProcessing={isProcessing}
              progress={progress}
            />
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <button
              onClick={() => setResults(null)}
              className="flex items-center gap-2 text-visual hover:text-visual-700 transition-colors font-medium"
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
      <footer className="bg-navy-800 border-t border-navy-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-navy-300 text-sm">
              <span>Powered by</span>
              <span className="text-white font-medium">Google Gemini AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-visual rounded-full"></span>
                <span className="text-navy-400">Visual</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-audio rounded-full"></span>
                <span className="text-navy-400">Audio</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-readwrite rounded-full"></span>
                <span className="text-navy-400">Read/Write</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-kinesthetic rounded-full"></span>
                <span className="text-navy-400">Kinesthetic</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
