import { useState, useEffect, useRef } from 'react'

function AudioTab({ script }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(1)
  const utteranceRef = useRef(null)

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      // Prefer an English voice
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en-'))
      if (englishVoice) {
        setSelectedVoice(englishVoice)
      }
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const handlePlay = () => {
    if (isPaused) {
      speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(script)
    utterance.voice = selectedVoice
    utterance.rate = rate
    utterance.pitch = 1

    utterance.onstart = () => {
      setIsPlaying(true)
      setProgress(0)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setProgress(100)
    }

    utterance.onpause = () => {
      setIsPaused(true)
      setIsPlaying(false)
    }

    utterance.onresume = () => {
      setIsPaused(false)
      setIsPlaying(true)
    }

    // Approximate progress based on word boundaries
    let wordCount = 0
    const totalWords = script.split(/\s+/).length
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordCount++
        setProgress(Math.round((wordCount / totalWords) * 100))
      }
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    speechSynthesis.pause()
    setIsPaused(true)
    setIsPlaying(false)
  }

  const handleStop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
  }

  if (!script) {
    return (
      <div className="text-center py-12 text-gray-500">
        No audio script available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">Audio Explanation</h2>
        <p className="text-gray-600 mt-1">Listen to a narrated explanation of the concepts</p>
      </div>

      {/* Audio Player Controls */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1 opacity-80">
            <span>{progress}%</span>
            <span>{isPlaying ? 'Playing...' : isPaused ? 'Paused' : 'Ready'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-4 rounded-full bg-white text-indigo-600 hover:bg-gray-100 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => {
              handleStop()
              setTimeout(handlePlay, 100)
            }}
            disabled={!isPlaying && !isPaused}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-700">Voice Settings</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Voice</label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value)
                setSelectedVoice(voice)
              }}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Speed: {rate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Script Display */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-2">Script</h3>
        <div className="text-gray-600 text-sm leading-relaxed max-h-64 overflow-y-auto">
          {script}
        </div>
      </div>
    </div>
  )
}

export default AudioTab
