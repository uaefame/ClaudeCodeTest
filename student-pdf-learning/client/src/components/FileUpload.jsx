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

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {!isProcessing ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
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
                className={`w-16 h-16 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`}
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
              <p className="text-lg text-gray-700">
                Drag and drop your PDF here, or{' '}
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-indigo-600 font-semibold hover:text-indigo-800"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports homework assignments and textbook chapters (max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-indigo-600 animate-spin"
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
            <h3 className="text-lg font-semibold text-gray-800">Processing your PDF</h3>
            <p className="text-gray-600 mt-1">{fileName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{progress.step}</span>
              <span className="font-medium text-indigo-600">{progress.percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {['Report', 'Quiz', 'Audio', 'Infographic'].map((item, i) => (
              <div
                key={item}
                className={`p-3 rounded-lg ${
                  progress.percent > (i + 1) * 20
                    ? 'bg-green-100 text-green-700'
                    : progress.percent > i * 20
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {item}
              </div>
            ))}
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
