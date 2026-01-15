import { useState, useEffect, useRef } from 'react'

function AudioTab({ audioData }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [useWebSpeech, setUseWebSpeech] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(1)
  const audioRef = useRef(null)
  const utteranceRef = useRef(null)

  // Determine if we have Gemini TTS audio or need to fall back to Web Speech
  const hasGeminiAudio = audioData?.audio?.data
  const script = audioData?.script || (typeof audioData === 'string' ? audioData : '')

  useEffect(() => {
    // If no Gemini audio, set up Web Speech API fallback
    if (!hasGeminiAudio) {
      setUseWebSpeech(true)
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en-'))
        if (englishVoice) {
          setSelectedVoice(englishVoice)
        }
      }
      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      speechSynthesis.cancel()
    }
  }, [hasGeminiAudio])

  // Set up audio element for Gemini TTS
  useEffect(() => {
    if (hasGeminiAudio && audioRef.current) {
      const audioSrc = `data:${audioData.audio.mimeType};base64,${audioData.audio.data}`
      audioRef.current.src = audioSrc

      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration)
      }

      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current.currentTime)
        if (audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
        }
      }

      audioRef.current.onended = () => {
        setIsPlaying(false)
        setProgress(100)
      }
    }
  }, [hasGeminiAudio, audioData])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlay = () => {
    if (hasGeminiAudio && audioRef.current) {
      if (isPaused) {
        audioRef.current.play()
      } else {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
      setIsPlaying(true)
      setIsPaused(false)
    } else {
      // Web Speech API fallback
      if (isPaused) {
        speechSynthesis.resume()
        setIsPaused(false)
        setIsPlaying(true)
        return
      }

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
  }

  const handlePause = () => {
    if (hasGeminiAudio && audioRef.current) {
      audioRef.current.pause()
      setIsPaused(true)
      setIsPlaying(false)
    } else {
      speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    if (hasGeminiAudio && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } else {
      speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
    setCurrentTime(0)
  }

  const handleSeek = (e) => {
    if (hasGeminiAudio && audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = percent * duration
      setProgress(percent * 100)
    }
  }

  if (!script && !hasGeminiAudio) {
    return (
      <div className="text-center py-12 text-navy-400">
        No audio available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-audio-50 rounded-full mb-2">
          <span className="w-2 h-2 bg-audio rounded-full"></span>
          <span className="text-audio-700 text-sm font-medium">Audio Learning</span>
        </div>
        <h2 className="text-xl font-bold text-navy-800 font-heading">Audio Explanation</h2>
        <p className="text-navy-500 mt-1">
          {hasGeminiAudio
            ? 'AI-generated natural voice narration'
            : 'Listen to a narrated explanation of the concepts'}
        </p>
        {hasGeminiAudio && (
          <span className="inline-block mt-2 px-3 py-1 bg-audio-100 text-audio-700 text-xs rounded-full">
            Powered by Gemini TTS
          </span>
        )}
      </div>

      {/* Hidden audio element for Gemini TTS */}
      {hasGeminiAudio && <audio ref={audioRef} />}

      {/* Audio Player Controls */}
      <div className="bg-gradient-to-r from-audio-500 to-audio-600 rounded-xl p-6 text-white">
        {/* Progress Bar */}
        <div className="mb-6">
          <div
            className="w-full bg-white/30 rounded-full h-2 cursor-pointer"
            onClick={hasGeminiAudio ? handleSeek : undefined}
          >
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1 opacity-80">
            <span>
              {hasGeminiAudio
                ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                : `${Math.round(progress)}%`}
            </span>
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
            className="p-4 rounded-full bg-white text-audio hover:bg-gray-100 transition-colors shadow-lg"
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

      {/* Voice Settings - Only show for Web Speech API fallback */}
      {useWebSpeech && !hasGeminiAudio && (
        <div className="bg-navy-50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-navy-700">Voice Settings (Browser TTS)</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-navy-600 mb-1">Voice</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value)
                  setSelectedVoice(voice)
                }}
                className="w-full p-2 border border-navy-200 rounded-lg focus:ring-2 focus:ring-audio focus:border-audio"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-navy-600 mb-1">
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
      )}

      {/* Download Button for Gemini Audio */}
      {hasGeminiAudio && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.href = `data:${audioData.audio.mimeType};base64,${audioData.audio.data}`
              link.download = 'audio-explanation.wav'
              link.click()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-audio text-white rounded-lg hover:bg-audio-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Audio
          </button>
        </div>
      )}

      {/* Script Display */}
      {script && (
        <div className="bg-white border border-navy-100 rounded-lg p-4">
          <h3 className="font-semibold text-navy-700 mb-2">Script</h3>
          <div className="text-navy-600 text-sm leading-relaxed max-h-64 overflow-y-auto">
            {script}
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioTab
