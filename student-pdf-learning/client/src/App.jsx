import { useState } from 'react'
import FileUpload from './components/FileUpload'
import TabContainer from './components/TabContainer'
import VarkAssessment from './components/VarkAssessment'
import { AuthProvider } from './contexts/AuthContext'
import LoginButton from './components/LoginButton'
import UserHistory from './components/UserHistory'
import { API_URL } from './config'

function App() {
  const [currentView, setCurrentView] = useState('main') // 'main' | 'assessment'
  const [results, setResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ percent: 0, step: '' })
  const [jobId, setJobId] = useState(null)
  const [rerunStates, setRerunStates] = useState({
    infographic: { isLoading: false, versions: [], activeVersion: 0, error: null },
    audioScript: { isLoading: false, versions: [], activeVersion: 0, error: null },
    interactiveLearning: { isLoading: false, versions: [], activeVersion: 0, error: null },
    report: { isLoading: false, versions: [], activeVersion: 0, error: null }
  })

  const handleProcessingComplete = (data, receivedJobId) => {
    setResults(data)
    setJobId(receivedJobId)
    setIsProcessing(false)
    // Reset rerun states when new content is generated
    setRerunStates({
      infographic: { isLoading: false, versions: [], activeVersion: 0, error: null },
      audioScript: { isLoading: false, versions: [], activeVersion: 0, error: null },
      interactiveLearning: { isLoading: false, versions: [], activeVersion: 0, error: null },
      report: { isLoading: false, versions: [], activeVersion: 0, error: null }
    })
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setResults(null)
  }

  const handleProgressUpdate = (progressData) => {
    setProgress(progressData)
  }

  const handleRerun = async (contentType, additionalInstructions) => {
    if (!jobId) return

    setRerunStates(prev => ({
      ...prev,
      [contentType]: { ...prev[contentType], isLoading: true, error: null }
    }))

    try {
      const response = await fetch(`${API_URL}/api/rerun`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jobId, contentType, additionalInstructions })
      })

      if (!response.ok) {
        throw new Error('Failed to start regeneration')
      }

      const { rerunId } = await response.json()
      pollForRerunResult(contentType, rerunId)
    } catch (error) {
      setRerunStates(prev => ({
        ...prev,
        [contentType]: { ...prev[contentType], isLoading: false, error: error.message }
      }))
    }
  }

  const pollForRerunResult = async (contentType, rerunId) => {
    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/api/status/${jobId}`, { credentials: 'include' })
        const data = await response.json()

        const rerunStatus = data.rerunStatus?.[contentType]

        if (rerunStatus?.status === 'completed') {
          // Check if this was stored as original content (first generation for this type)
          if (rerunStatus.isOriginal) {
            // Update results with the new original content
            setResults(prev => ({
              ...prev,
              ...data.results
            }))
            // Reset rerun state for this content type (no versions yet)
            setRerunStates(prev => ({
              ...prev,
              [contentType]: {
                isLoading: false,
                versions: [],
                activeVersion: 0,
                error: null
              }
            }))
          } else {
            // This is a regeneration - add to versions
            const versions = data.rerunVersions?.[contentType] || []
            setRerunStates(prev => ({
              ...prev,
              [contentType]: {
                isLoading: false,
                versions: versions,
                activeVersion: versions.length,
                error: null
              }
            }))
          }
        } else if (rerunStatus?.status === 'error') {
          setRerunStates(prev => ({
            ...prev,
            [contentType]: { ...prev[contentType], isLoading: false, error: rerunStatus.error }
          }))
        } else {
          setTimeout(poll, 1000)
        }
      } catch (error) {
        setRerunStates(prev => ({
          ...prev,
          [contentType]: { ...prev[contentType], isLoading: false, error: 'Failed to check status' }
        }))
      }
    }
    poll()
  }

  const handleVersionChange = (contentType, versionIndex) => {
    setRerunStates(prev => ({
      ...prev,
      [contentType]: { ...prev[contentType], activeVersion: versionIndex }
    }))
  }

  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-visual/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-audio/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-kinesthetic/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-[var(--border-color)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Masari Logo - Four VARK paths with glow */}
              <button
                onClick={() => setCurrentView('main')}
                className="flex items-center gap-0.5 float-animation cursor-pointer"
              >
                <div className="w-2 h-8 bg-gradient-to-b from-visual to-visual-600 rounded-full transform -rotate-12 shadow-visual-glow"></div>
                <div className="w-2 h-8 bg-gradient-to-b from-audio to-audio-600 rounded-full transform -rotate-4 shadow-audio-glow"></div>
                <div className="w-2 h-8 bg-gradient-to-b from-readwrite to-readwrite-600 rounded-full transform rotate-4 shadow-readwrite-glow"></div>
                <div className="w-2 h-8 bg-gradient-to-b from-kinesthetic to-kinesthetic-600 rounded-full transform rotate-12 shadow-kinesthetic-glow"></div>
              </button>
              <div>
                <button
                  onClick={() => setCurrentView('main')}
                  className="text-2xl font-bold text-adaptive font-heading tracking-tight hover:opacity-80 transition-opacity"
                >
                  Masark
                </button>
                <p className="text-adaptive-secondary text-sm font-body">
                  Learn Your Way
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView(currentView === 'assessment' ? 'main' : 'assessment')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 border ${
                  currentView === 'assessment'
                    ? 'bg-visual/20 text-visual border-visual/30 shadow-visual-glow'
                    : 'bg-dark-200 text-gray-300 border-white/10 hover:bg-visual/10 hover:text-visual hover:border-visual/30'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="hidden sm:inline">VARK Assessment</span>
              </button>
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* VARK Color Bar with glow */}
      <div className="h-1 flex relative">
        <div className="flex-1 bg-gradient-to-r from-visual to-visual-600 shadow-visual-glow"></div>
        <div className="flex-1 bg-gradient-to-r from-audio to-audio-600 shadow-audio-glow"></div>
        <div className="flex-1 bg-gradient-to-r from-readwrite to-readwrite-600 shadow-readwrite-glow"></div>
        <div className="flex-1 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 shadow-kinesthetic-glow"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {currentView === 'assessment' ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-adaptive font-heading mb-2">
                VARK <span className="bg-gradient-to-r from-visual via-audio to-kinesthetic bg-clip-text text-transparent">Learning Style</span> Assessment
              </h2>
              <p className="text-adaptive-secondary font-body max-w-2xl mx-auto">
                Discover your unique learning style to get the most out of your study sessions
              </p>
            </div>
            <VarkAssessment onBack={() => setCurrentView('main')} />
          </div>
        ) : (
          <>
            {!results && (
              <div className="space-y-6">
                <UserHistory onSelectUpload={(jobId) => console.log('Load upload:', jobId)} />
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-adaptive font-heading mb-2">
                    Personalized Learning, <span className="bg-gradient-to-r from-visual via-audio to-kinesthetic bg-clip-text text-transparent">Your Way</span>
                  </h2>
                  <p className="text-adaptive-secondary font-body max-w-2xl mx-auto">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-visual/20 text-visual-400 hover:bg-visual/30 hover:text-visual-300 transition-all duration-300 font-medium border border-visual/30 hover:border-visual/50 hover:shadow-visual-glow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Upload another PDF
                </button>
                <TabContainer
                  results={results}
                  rerunStates={rerunStates}
                  onRerun={handleRerun}
                  onVersionChange={handleVersionChange}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-adaptive-secondary text-sm">
              <span>Powered by</span>
              <span className="font-medium bg-gradient-to-r from-visual via-audio to-kinesthetic bg-clip-text text-transparent">Google Gemini AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-visual rounded-full shadow-visual-glow"></span>
                <span className="text-adaptive-secondary">Visual</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-audio rounded-full shadow-audio-glow"></span>
                <span className="text-adaptive-secondary">Audio</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-readwrite rounded-full shadow-readwrite-glow"></span>
                <span className="text-adaptive-secondary">Read/Write</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 bg-kinesthetic rounded-full shadow-kinesthetic-glow"></span>
                <span className="text-adaptive-secondary">Kinesthetic</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </AuthProvider>
  )
}

export default App
