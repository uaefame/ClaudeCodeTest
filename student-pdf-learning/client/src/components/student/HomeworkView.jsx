import { useState, useEffect } from 'react'
import { API_URL } from '../../config'

export default function HomeworkView({ studentHomeworkId, onBack }) {
  const [homework, setHomework] = useState(null)
  const [answers, setAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState({})

  useEffect(() => {
    fetchHomework()
  }, [studentHomeworkId])

  const fetchHomework = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/homework/${studentHomeworkId}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch homework')
      const data = await response.json()
      setHomework(data)

      // Initialize answers from existing answers
      const existingAnswers = {}
      data.answers?.forEach(a => {
        existingAnswers[a.questionId] = a.answer
      })
      setAnswers(existingAnswers)

      // Check if already submitted
      if (data.status === 'submitted') {
        setShowResults(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmitAnswer = async (questionId) => {
    const answer = answers[questionId]
    if (answer === undefined || answer === null || answer === '') return

    try {
      const response = await fetch(`${API_URL}/api/homework/${studentHomeworkId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questionId, answer })
      })

      if (!response.ok) throw new Error('Failed to submit answer')

      const data = await response.json()
      setAnswerFeedback(prev => ({
        ...prev,
        [questionId]: {
          isCorrect: data.isCorrect,
          score: data.score,
          maxScore: data.maxScore
        }
      }))

      // Update progress
      setHomework(prev => ({
        ...prev,
        progress: data.progress
      }))
    } catch (err) {
      console.error('Error submitting answer:', err)
    }
  }

  const handleSubmitHomework = async () => {
    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/api/homework/${studentHomeworkId}/submit`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to submit homework')

      const data = await response.json()
      setHomework(prev => ({
        ...prev,
        status: 'submitted',
        score: data.score
      }))
      setShowResults(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kinesthetic"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/30 text-center">
        <p className="text-red-400">Error: {error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
          Go Back
        </button>
      </div>
    )
  }

  const questions = homework?.questions || []
  const question = questions[currentQuestion]
  const isSubmitted = homework?.status === 'submitted'

  // Results view
  if (showResults && isSubmitted) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-adaptive-secondary hover:text-adaptive transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Homework List
        </button>

        <div className="glass-card p-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-kinesthetic/20 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-kinesthetic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-adaptive mb-2">Homework Submitted!</h2>
          <p className="text-adaptive-secondary mb-6">{homework?.title}</p>

          <div className="inline-block p-6 bg-white/5 rounded-xl">
            <p className="text-5xl font-bold text-kinesthetic mb-2">
              {homework?.score?.percentage || 0}%
            </p>
            <p className="text-adaptive-secondary">
              {homework?.score?.earned || 0} / {homework?.score?.total || 0} points
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-adaptive">{homework?.title}</h1>
          <p className="text-adaptive-secondary">
            Version {homework?.version} • {homework?.grade} • {homework?.difficulty}
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-200 text-gray-300 border border-white/10 hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit
        </button>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-adaptive-secondary">Progress</span>
          <span className="text-sm text-adaptive">
            {homework?.progress?.questionsAnswered || 0} / {questions.length} answered
          </span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-kinesthetic transition-all duration-300"
            style={{ width: `${homework?.progress?.percentComplete || 0}%` }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== ''
          const isCurrent = i === currentQuestion
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                isCurrent
                  ? 'bg-kinesthetic text-white'
                  : isAnswered
                    ? 'bg-kinesthetic/20 text-kinesthetic'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Current Question */}
      {question && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-sm text-adaptive-secondary">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-sm text-kinesthetic">
                {question.type?.replace('_', ' ')} • {question.points || 1} pts
              </span>
            </div>
          </div>

          <p className="text-lg text-adaptive">{question.question}</p>

          {/* Answer Input based on type */}
          <div className="space-y-3">
            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options?.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerChange(question.id, i)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      answers[question.id] === i
                        ? 'bg-kinesthetic/20 border-2 border-kinesthetic'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    } ${isSubmitted ? 'cursor-not-allowed' : ''}`}
                  >
                    <span className="text-adaptive">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'true_false' && (
              <div className="flex gap-4">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    onClick={() => handleAnswerChange(question.id, value)}
                    disabled={isSubmitted}
                    className={`flex-1 p-4 rounded-xl font-medium transition-all ${
                      answers[question.id] === value
                        ? 'bg-kinesthetic/20 border-2 border-kinesthetic text-kinesthetic'
                        : 'bg-white/5 border-2 border-transparent text-adaptive hover:bg-white/10'
                    } ${isSubmitted ? 'cursor-not-allowed' : ''}`}
                  >
                    {value ? 'True' : 'False'}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'fill_in_blank' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                disabled={isSubmitted}
                placeholder="Type your answer..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive placeholder-gray-500 focus:border-kinesthetic/50 focus:outline-none disabled:opacity-50"
              />
            )}

            {(question.type === 'short_answer' || question.type === 'essay') && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                disabled={isSubmitted}
                placeholder={question.type === 'essay' ? 'Write your essay response...' : 'Write your answer...'}
                rows={question.type === 'essay' ? 8 : 4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive placeholder-gray-500 focus:border-kinesthetic/50 focus:outline-none resize-none disabled:opacity-50"
              />
            )}
          </div>

          {/* Save Answer Button */}
          {!isSubmitted && (
            <button
              onClick={() => handleSubmitAnswer(question.id)}
              disabled={answers[question.id] === undefined || answers[question.id] === ''}
              className="px-4 py-2 rounded-lg bg-kinesthetic/20 text-kinesthetic hover:bg-kinesthetic/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Answer
            </button>
          )}

          {/* Feedback */}
          {answerFeedback[question.id] && (
            <div className={`p-3 rounded-lg ${
              answerFeedback[question.id].isCorrect
                ? 'bg-kinesthetic/10 text-kinesthetic'
                : answerFeedback[question.id].isCorrect === false
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-audio/10 text-audio'
            }`}>
              {answerFeedback[question.id].isCorrect === true && 'Correct!'}
              {answerFeedback[question.id].isCorrect === false && 'Incorrect'}
              {answerFeedback[question.id].isCorrect === null && 'Answer saved (will be graded later)'}
              <span className="ml-2">
                ({answerFeedback[question.id].score}/{answerFeedback[question.id].maxScore} pts)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-adaptive hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {currentQuestion === questions.length - 1 && !isSubmitted ? (
          <button
            onClick={handleSubmitHomework}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-kinesthetic text-white hover:bg-kinesthetic-600 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                Submit Homework
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQuestion === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-kinesthetic text-white hover:bg-kinesthetic-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
