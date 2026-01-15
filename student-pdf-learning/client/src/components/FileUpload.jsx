import { useState, useRef } from 'react'

function FileUpload({ onProcessingStart, onProcessingComplete, onProgressUpdate, isProcessing, progress }) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef(null)

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
    onProcessingStart()

    try {
      // Upload file
      const formData = new FormData()
      formData.append('pdf', file)

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
      onProcessingComplete(null)
    }
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
          onProcessingComplete(data.results)
        } else if (data.status === 'error') {
          setError(data.error || 'Processing failed')
          onProcessingComplete(null)
        } else {
          // Continue polling
          setTimeout(poll, 1000)
        }
      } catch (err) {
        setError('Failed to check status')
        onProcessingComplete(null)
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
    <div className="bg-white rounded-xl shadow-lg p-8 border border-navy-100">
      {!isProcessing ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-visual bg-visual-50'
              : 'border-navy-200 hover:border-visual-300'
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
              <svg
                className={`w-16 h-16 ${dragActive ? 'text-visual' : 'text-navy-300'}`}
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

            <div>
              <p className="text-lg text-navy-700">
                Drag and drop your PDF here, or{' '}
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-visual font-semibold hover:text-visual-600"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-navy-400 mt-2">
                Supports homework assignments and textbook chapters (max 10MB)
              </p>
            </div>

            {/* VARK Preview */}
            <div className="flex justify-center gap-3 mt-6 pt-6 border-t border-navy-100">
              {varkSteps.map((step) => (
                <div key={step.name} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full bg-${step.color}`}></span>
                  <span className="text-xs text-navy-400">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-visual-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-visual animate-spin"
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
            <h3 className="text-lg font-semibold text-navy-800 font-heading">Generating Your Learning Materials</h3>
            <p className="text-navy-500 mt-1">{fileName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">{progress.step}</span>
              <span className="font-medium text-visual">{progress.percent}%</span>
            </div>
            <div className="w-full bg-navy-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-visual via-audio via-readwrite to-kinesthetic h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {varkSteps.map((step, i) => {
              const isComplete = progress.percent > (i + 1) * 20
              const isActive = progress.percent > i * 20 && progress.percent <= (i + 1) * 20

              return (
                <div
                  key={step.name}
                  className={`p-3 rounded-lg transition-all ${
                    isComplete
                      ? `bg-${step.color}-100 text-${step.color}-700`
                      : isActive
                      ? `bg-${step.color}-50 text-${step.color} ring-2 ring-${step.color}`
                      : 'bg-navy-50 text-navy-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full bg-${step.color} ${isActive ? 'animate-pulse' : ''}`}></span>
                    <span>{step.name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default FileUpload
