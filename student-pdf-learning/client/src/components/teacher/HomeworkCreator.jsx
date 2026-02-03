import { useState, useRef } from 'react'
import { API_URL } from '../../config'
import QuestionTypeSelector from './QuestionTypeSelector'

export default function HomeworkCreator({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1) // 1: Upload, 2: Configure, 3: Generate, 4: Preview
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [grade, setGrade] = useState('high')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionConfig, setQuestionConfig] = useState({
    multipleChoice: 5,
    trueFalse: 3,
    shortAnswer: 2,
    essay: 0,
    fillInBlank: 2
  })
  const [homeworkId, setHomeworkId] = useState(null)
  const [homework, setHomework] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generationStatus, setGenerationStatus] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setError(null)
    } else {
      setError('Please select a PDF file')
    }
  }

  const handleCreateHomework = async () => {
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!selectedFile) {
      setError('Please upload a PDF file')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('pdf', selectedFile)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('grade', grade)
      formData.append('difficulty', difficulty)
      formData.append('questionConfig', JSON.stringify(questionConfig))

      const response = await fetch(`${API_URL}/api/teacher/homework`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create homework')
      }

      const data = await response.json()
      setHomeworkId(data.homework._id)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateQuestions = async () => {
    if (!homeworkId) return

    setIsLoading(true)
    setError(null)
    setGenerationStatus('Starting generation...')

    try {
      const response = await fetch(`${API_URL}/api/teacher/homework/${homeworkId}/generate`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start generation')
      }

      // Poll for completion
      pollGenerationStatus()
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const pollGenerationStatus = async () => {
    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/api/teacher/homework/${homeworkId}`, {
          credentials: 'include'
        })
        const data = await response.json()
        const hw = data.homework

        if (hw.status === 'ready') {
          setHomework(hw)
          setGenerationStatus(null)
          setIsLoading(false)
          setStep(4)
        } else if (hw.status === 'generating') {
          setGenerationStatus('Generating questions... This may take a minute.')
          setTimeout(poll, 2000)
        } else if (hw.status === 'draft') {
          // Generation may have failed, check if there's an error
          setError('Generation failed. Please try again.')
          setIsLoading(false)
        }
      } catch (err) {
        setError('Failed to check generation status')
        setIsLoading(false)
      }
    }
    poll()
  }

  const handlePublish = async () => {
    if (!homeworkId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/teacher/homework/${homeworkId}/publish`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to publish')
      }

      const data = await response.json()
      setHomework(prev => ({ ...prev, shareCode: data.shareCode, status: 'published' }))
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const totalQuestions = Object.values(questionConfig).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              step >= s ? 'bg-readwrite text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`w-12 h-1 ${step > s ? 'bg-readwrite' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center gap-8 text-sm text-adaptive-secondary">
        <span className={step === 1 ? 'text-readwrite' : ''}>Upload</span>
        <span className={step === 2 ? 'text-readwrite' : ''}>Configure</span>
        <span className={step === 3 ? 'text-readwrite' : ''}>Generate</span>
        <span className={step === 4 ? 'text-readwrite' : ''}>Preview</span>
      </div>

      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-adaptive mb-2">Homework Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 - Photosynthesis"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive placeholder-gray-500 focus:border-readwrite/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-adaptive mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the homework..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive placeholder-gray-500 focus:border-readwrite/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-adaptive mb-2">Source Material (PDF) *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                selectedFile ? 'border-readwrite/50 bg-readwrite/5' : 'border-white/20 hover:border-white/40'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-8 h-8 text-readwrite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-adaptive">{selectedFile.name}</p>
                    <p className="text-sm text-adaptive-secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-adaptive">Click to upload or drag and drop</p>
                  <p className="text-sm text-adaptive-secondary">PDF files up to 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-xl border border-white/10 text-adaptive-secondary hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!title.trim()) {
                  setError('Please enter a title')
                  return
                }
                if (!selectedFile) {
                  setError('Please upload a PDF file')
                  return
                }
                setError(null)
                setStep(2)
              }}
              className="px-6 py-2 rounded-xl bg-readwrite text-white hover:bg-readwrite-600 transition-all"
            >
              Next: Configure Questions
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="glass-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-adaptive mb-2">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive focus:border-readwrite/50 focus:outline-none"
              >
                <option value="elementary">Elementary School</option>
                <option value="middle">Middle School</option>
                <option value="high">High School</option>
                <option value="university">University</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-adaptive mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive focus:border-readwrite/50 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <QuestionTypeSelector
            config={questionConfig}
            onChange={setQuestionConfig}
          />

          <div className="p-4 bg-readwrite/10 rounded-xl">
            <p className="text-center text-adaptive">
              Total Questions: <span className="font-bold text-readwrite">{totalQuestions}</span>
            </p>
            <p className="text-center text-sm text-adaptive-secondary mt-1">
              Two versions (A and B) will be generated with different questions
            </p>
          </div>

          <div className="flex justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 rounded-xl border border-white/10 text-adaptive-secondary hover:bg-white/5 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleCreateHomework}
              disabled={isLoading || totalQuestions === 0}
              className="px-6 py-2 rounded-xl bg-readwrite text-white hover:bg-readwrite-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create & Continue'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generate */}
      {step === 3 && (
        <div className="glass-card p-6 space-y-6 text-center">
          {!isLoading && !generationStatus ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-readwrite/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-readwrite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-adaptive">Ready to Generate Questions</h3>
                <p className="text-adaptive-secondary mt-2">
                  AI will analyze your PDF and create two versions of homework with {totalQuestions} questions each.
                </p>
              </div>
              <button
                onClick={handleGenerateQuestions}
                className="px-8 py-3 rounded-xl bg-readwrite text-white hover:bg-readwrite-600 transition-all"
              >
                Generate Questions
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-readwrite border-t-transparent mx-auto"></div>
              <div>
                <h3 className="text-xl font-semibold text-adaptive">Generating Questions...</h3>
                <p className="text-adaptive-secondary mt-2">{generationStatus}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && homework && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-adaptive">{homework.title}</h3>
              <span className="px-3 py-1 rounded-full bg-kinesthetic/20 text-kinesthetic text-sm font-medium">
                Ready to Publish
              </span>
            </div>

            {/* Version Tabs */}
            <div className="flex gap-4 mb-4">
              {['A', 'B'].map(version => (
                <div key={version} className="flex-1 p-4 bg-white/5 rounded-xl">
                  <h4 className="font-medium text-adaptive mb-2">Version {version}</h4>
                  <p className="text-sm text-adaptive-secondary">
                    {homework.versions?.[version]?.questions?.length || 0} questions
                  </p>
                  <p className="text-sm text-adaptive-secondary">
                    {homework.versions?.[version]?.totalPoints || 0} total points
                  </p>
                  <p className="text-sm text-adaptive-secondary">
                    Est. time: {homework.versions?.[version]?.estimatedTime || 'N/A'}
                  </p>
                </div>
              ))}
            </div>

            {/* Sample Questions */}
            <div className="space-y-3">
              <h4 className="font-medium text-adaptive">Sample Questions (Version A)</h4>
              {homework.versions?.A?.questions?.slice(0, 3).map((q, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-adaptive-secondary mb-1">
                    {q.type.replace('_', ' ').toUpperCase()} - {q.points} pts
                  </p>
                  <p className="text-adaptive">{q.question}</p>
                </div>
              ))}
              {homework.versions?.A?.questions?.length > 3 && (
                <p className="text-sm text-adaptive-secondary text-center">
                  ... and {homework.versions.A.questions.length - 3} more questions
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 rounded-xl border border-white/10 text-adaptive-secondary hover:bg-white/5 transition-all"
            >
              Back to Configure
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="px-8 py-3 rounded-xl bg-kinesthetic text-white hover:bg-kinesthetic-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Publish & Get Share Code
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
