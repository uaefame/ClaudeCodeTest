import { useState, useRef } from 'react'

const GRADE_LEVELS = [
  { value: 'elementary', label: 'Elementary School (K-5)', description: 'Ages 5-11' },
  { value: 'middle', label: 'Middle School (6-8)', description: 'Ages 11-14' },
  { value: 'high', label: 'High School (9-12)', description: 'Ages 14-18' },
  { value: 'university', label: 'University / College', description: 'Ages 18+' },
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy for me', description: 'I understand most of this material', color: 'kinesthetic' },
  { value: 'medium', label: 'Moderate', description: 'Some parts are challenging', color: 'audio' },
  { value: 'hard', label: 'Hard for me', description: 'I need extra help understanding this', color: 'readwrite' },
]

const VARK_OPTIONS = [
  { id: 'visual', label: 'Visual', description: 'Infographic & visual summary', color: 'visual', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'audio', label: 'Audio', description: 'Narrated explanation', color: 'audio', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
  { id: 'readwrite', label: 'Read/Write', description: 'Detailed study report', color: 'readwrite', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'kinesthetic', label: 'Kinesthetic', description: 'Interactive learning & practice', color: 'kinesthetic', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
]

function FileUpload({ onProcessingStart, onProcessingComplete, onProgressUpdate, isProcessing, progress }) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [grade, setGrade] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [contentTypes, setContentTypes] = useState(['visual', 'audio', 'readwrite', 'kinesthetic']) // All selected by default
  const [step, setStep] = useState('upload') // 'upload', 'configure', 'processing'
  const inputRef = useRef(null)

  const toggleContentType = (typeId) => {
    setContentTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  const selectAllContentTypes = () => {
    setContentTypes(['visual', 'audio', 'readwrite', 'kinesthetic'])
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError(null)
    setFileName(file.name)
    setSelectedFile(file)
    setStep('configure')
  }

  const handleStartProcessing = async () => {
    if (!selectedFile || !grade || !difficulty) {
      setError('Please select grade level and difficulty')
      return
    }

    if (contentTypes.length === 0) {
      setError('Please select at least one content type to generate')
      return
    }

    setStep('processing')
    onProcessingStart()

    try {
      // Upload file with grade, difficulty, and content types
      const formData = new FormData()
      formData.append('pdf', selectedFile)
      formData.append('grade', grade)
      formData.append('difficulty', difficulty)
      formData.append('contentTypes', JSON.stringify(contentTypes))

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { jobId } = await uploadResponse.json()

      // Poll for results
      pollForResults(jobId)
    } catch (err) {
      setError(err.message || 'An error occurred')
      setStep('configure')
      onProcessingComplete(null)
    }
  }

  const handleBack = () => {
    setStep('upload')
    setSelectedFile(null)
    setFileName(null)
    setGrade('')
    setDifficulty('')
    setContentTypes(['visual', 'audio', 'readwrite', 'kinesthetic'])
    setError(null)
  }

  const pollForResults = async (jobId) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`)
        const data = await response.json()

        onProgressUpdate({
          percent: data.progress || 0,
          step: data.step || 'Processing...'
        })

        if (data.status === 'completed') {
          onProcessingComplete(data.results, jobId)
        } else if (data.status === 'error') {
          setError(data.error || 'Processing failed')
          onProcessingComplete(null, null)
        } else {
          // Continue polling
          setTimeout(poll, 1000)
        }
      } catch (err) {
        setError('Failed to check status')
        onProcessingComplete(null, null)
      }
    }

    poll()
  }

  const varkSteps = [
    { name: 'Visual', color: 'visual' },
    { name: 'Audio', color: 'audio' },
    { name: 'Read/Write', color: 'readwrite' },
    { name: 'Kinesthetic', color: 'kinesthetic' }
  ]

  return (
    <div className="card-glow p-8">
      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-visual bg-visual/10 shadow-visual-glow'
              : 'border-gray-600 hover:border-visual/50 hover:bg-visual/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-2xl transition-all duration-300 ${dragActive ? 'bg-visual/20 shadow-visual-glow' : 'bg-dark-200'}`}>
                <svg
                  className={`w-16 h-16 transition-colors duration-300 ${dragActive ? 'text-visual' : 'text-gray-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <p className="text-lg text-gray-300">
                Drag and drop your PDF here, or{' '}
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 ml-1 rounded-lg bg-gradient-to-r from-visual to-visual-600 text-white font-semibold hover:shadow-visual-glow transition-all duration-300 hover:scale-105"
                >
                  Browse Files
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Supports homework assignments and textbook chapters (max 10MB)
              </p>
            </div>

            {/* VARK Preview */}
            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-white/10">
              {varkSteps.map((s) => (
                <div key={s.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-200 border border-white/10">
                  <span className={`w-2.5 h-2.5 rounded-full bg-${s.color} shadow-${s.color}-glow`}></span>
                  <span className="text-xs text-gray-400">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Configure Grade & Difficulty */}
      {step === 'configure' && (
        <div className="space-y-6">
          {/* File Selected */}
          <div className="flex items-center gap-4 p-4 bg-dark-200 rounded-xl border border-white/10">
            <div className="p-3 bg-visual/20 rounded-xl">
              <svg className="w-8 h-8 text-visual" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{fileName}</p>
              <p className="text-sm text-gray-400">PDF ready for processing</p>
            </div>
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-white font-medium mb-3">What's your grade level?</label>
            <div className="grid grid-cols-2 gap-3">
              {GRADE_LEVELS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGrade(g.value)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                    grade === g.value
                      ? 'border-visual bg-visual/20 shadow-visual-glow'
                      : 'border-gray-600 hover:border-visual/50 hover:bg-visual/5'
                  }`}
                >
                  <p className={`font-medium ${grade === g.value ? 'text-visual' : 'text-white'}`}>{g.label}</p>
                  <p className="text-sm text-gray-400 mt-1">{g.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-white font-medium mb-3">How difficult is this material for you?</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                    difficulty === d.value
                      ? `border-${d.color} bg-${d.color}/20 shadow-${d.color}-glow`
                      : 'border-gray-600 hover:border-gray-500 hover:bg-dark-300'
                  }`}
                >
                  <p className={`font-medium ${difficulty === d.value ? `text-${d.color}` : 'text-white'}`}>{d.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* VARK Content Type Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">What content would you like to generate?</label>
              <button
                onClick={selectAllContentTypes}
                className={`text-sm px-3 py-1 rounded-lg transition-all duration-300 ${
                  contentTypes.length === 4
                    ? 'bg-visual/20 text-visual border border-visual/30'
                    : 'bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-200'
                }`}
              >
                {contentTypes.length === 4 ? 'All Selected' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {VARK_OPTIONS.map((option) => {
                const isSelected = contentTypes.includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleContentType(option.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 border-2 flex items-start gap-3 ${
                      isSelected
                        ? `border-${option.color} bg-${option.color}/20 shadow-${option.color}-glow`
                        : 'border-gray-600 hover:border-gray-500 hover:bg-dark-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? `bg-${option.color} shadow-${option.color}-glow`
                        : 'bg-dark-300 border border-gray-500'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {/* Icon and Label */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-5 h-5 ${isSelected ? `text-${option.color}` : 'text-gray-400'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                        </svg>
                        <span className={`font-medium ${isSelected ? `text-${option.color}` : 'text-white'}`}>
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleStartProcessing}
            disabled={!grade || !difficulty || contentTypes.length === 0}
            className="w-full py-4 bg-gradient-to-r from-visual via-audio to-kinesthetic text-white rounded-xl font-bold text-lg hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
          >
            Generate {contentTypes.length === 4 ? 'All' : contentTypes.length} Learning Material{contentTypes.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 'processing' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-visual/20 to-audio/20 rounded-2xl mb-4 shadow-glow pulse-glow">
              <svg
                className="w-10 h-10 text-visual animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white font-heading">Generating Your Learning Materials</h3>
            <p className="text-gray-400 mt-1">{fileName}</p>
            <p className="text-sm text-gray-500 mt-2">
              {GRADE_LEVELS.find(g => g.value === grade)?.label} • {DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.label}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{progress.step}</span>
              <span className="font-medium text-visual">{progress.percent}%</span>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-visual via-audio via-readwrite to-kinesthetic h-3 rounded-full transition-all duration-500 shadow-glow"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {varkSteps.map((s, i) => {
              const isComplete = progress.percent > (i + 1) * 20
              const isActive = progress.percent > i * 20 && progress.percent <= (i + 1) * 20

              return (
                <div
                  key={s.name}
                  className={`p-3 rounded-xl transition-all duration-300 border ${
                    isComplete
                      ? `bg-${s.color}/20 text-${s.color}-400 border-${s.color}/30 shadow-${s.color}-glow`
                      : isActive
                      ? `bg-${s.color}/10 text-${s.color} border-${s.color}/50 ring-2 ring-${s.color}/50`
                      : 'bg-dark-200 text-gray-500 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-${s.color} ${isActive ? 'animate-pulse' : ''}`}></span>
                    <span>{s.name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default FileUpload
