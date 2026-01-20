import { useState, useEffect, useRef } from 'react'
import RerunControl from './RerunControl'

function AudioTab({ audioData, rerunState, onRerun, onVersionChange }) {
  // Determine which content to display based on active version
  const getDisplayData = () => {
    if (!rerunState || rerunState.activeVersion === 0 || !rerunState.versions?.length) {
      return audioData
    }
    const versionIndex = rerunState.activeVersion - 1
    return rerunState.versions[versionIndex]?.data || audioData
  }

  const displayData = getDisplayData()

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
  const hasGeminiAudio = displayData?.audio?.data
  const script = displayData?.script || (typeof displayData === 'string' ? displayData : '')

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
      const audioSrc = `data:${displayData.audio.mimeType};base64,${displayData.audio.data}`
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
  }, [hasGeminiAudio, displayData])

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

  // Check if we have versions available even if original content is empty
  const hasVersions = rerunState?.versions?.length > 0
  const hasOriginalContent = !!(audioData?.script || audioData?.audio?.data)

  if (!script && !hasGeminiAudio) {
    return (
      <div className="text-center py-12 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-audio/20 rounded-full mb-4 border border-audio/30">
            <span className="w-2 h-2 bg-audio rounded-full shadow-audio-glow"></span>
            <span className="text-audio text-sm font-medium">Audio Learning</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Audio Explanation</h2>
          <p className="text-gray-400 mt-2">
            {hasVersions
              ? 'No original content was generated. Select a version below or generate new content.'
              : 'This content wasn\'t generated initially.'}
          </p>
        </div>

        {/* Show version toggle if versions exist */}
        {hasVersions && (
          <RerunControl
            color="audio"
            rerunState={rerunState}
            onRerun={onRerun}
            onVersionChange={onVersionChange}
            hideOriginal={!hasOriginalContent}
          />
        )}

        <button
          onClick={() => onRerun?.('')}
          disabled={rerunState?.isLoading}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            rerunState?.isLoading
              ? 'bg-audio/30 text-audio/70 cursor-not-allowed'
              : 'bg-gradient-to-r from-audio to-audio-600 text-white hover:shadow-audio-glow hover:scale-105'
          }`}
        >
          {rerunState?.isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            hasVersions ? 'Generate New Version' : 'Generate Audio'
          )}
        </button>
        {rerunState?.error && (
          <p className="text-red-400 text-sm">{rerunState.error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-audio/20 rounded-full mb-2 border border-audio/30">
          <span className="w-2 h-2 bg-audio rounded-full shadow-audio-glow"></span>
          <span className="text-audio text-sm font-medium">Audio Learning</span>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Audio Explanation</h2>
        <p className="text-gray-400 mt-1">
          {hasGeminiAudio
            ? 'AI-generated natural voice narration'
            : 'Listen to a narrated explanation of the concepts'}
        </p>
        {hasGeminiAudio && (
          <span className="inline-block mt-2 px-3 py-1.5 bg-audio/20 text-audio text-xs rounded-full border border-audio/30">
            Powered by Gemini TTS
          </span>
        )}
      </div>

      {/* Rerun Control */}
      <RerunControl
        color="audio"
        rerunState={rerunState}
        onRerun={onRerun}
        onVersionChange={onVersionChange}
      />

      {/* Hidden audio element for Gemini TTS */}
      {hasGeminiAudio && <audio ref={audioRef} />}

      {/* Audio Player Controls */}
      <div className="bg-gradient-to-r from-audio to-audio-600 rounded-2xl p-6 text-white shadow-audio-glow">
        {/* Progress Bar */}
        <div className="mb-6">
          <div
            className="w-full bg-white/20 rounded-full h-3 cursor-pointer backdrop-blur-sm"
            onClick={hasGeminiAudio ? handleSeek : undefined}
          >
            <div
              className="bg-white h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2 opacity-90">
            <span className="font-medium">
              {hasGeminiAudio
                ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                : `${Math.round(progress)}%`}
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-white animate-pulse' : 'bg-white/50'}`}></span>
              {isPlaying ? 'Playing...' : isPaused ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="p-4 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="p-5 rounded-2xl bg-white text-audio hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
          >
            {isPlaying ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
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
            className="p-4 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Voice Settings - Only show for Web Speech API fallback */}
      {useWebSpeech && !hasGeminiAudio && (
        <div className="bg-dark-100 rounded-xl p-4 space-y-4 border border-white/10">
          <h3 className="font-semibold text-white">Voice Settings (Browser TTS)</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Voice</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value)
                  setSelectedVoice(voice)
                }}
                className="w-full p-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-audio focus:border-audio transition-all"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Speed: <span className="text-audio font-medium">{rate}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-audio"
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
              link.href = `data:${displayData.audio.mimeType};base64,${displayData.audio.data}`
              link.download = 'audio-explanation.wav'
              link.click()
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-audio to-audio-600 text-white rounded-xl hover:shadow-audio-glow transition-all duration-300 font-semibold hover:scale-105"
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
        <div className="bg-dark-100 border border-white/10 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3">Script</h3>
          <div className="text-gray-300 text-sm leading-relaxed max-h-64 overflow-y-auto">
            {script}
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioTab
