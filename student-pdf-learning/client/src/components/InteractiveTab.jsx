import { useState } from 'react'

function InteractiveTab({ data }) {
  const [phase, setPhase] = useState('learn') // 'learn' or 'practice'
  const [currentConcept, setCurrentConcept] = useState(0)
  const [currentExample, setCurrentExample] = useState(0)
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [choiceAnswers, setChoiceAnswers] = useState({})
  const [practiceAnswers, setPracticeAnswers] = useState({})
  const [showPracticeResults, setShowPracticeResults] = useState(false)
  const [completedConcepts, setCompletedConcepts] = useState([])

  if (!data || !data.concepts || data.concepts.length === 0) {
    return (
      <div className="text-center py-12 text-navy-400">
        No interactive content available
      </div>
    )
  }

  const concepts = data.concepts
  const practiceQuestions = data.practiceQuestions || []
  const concept = concepts[currentConcept]
  const examples = concept?.examples || []
  const example = examples[currentExample]

  const handleReveal = (conceptId, exampleIdx) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [`${conceptId}-${exampleIdx}`]: true
    }))
  }

  const handleChoice = (conceptId, exampleIdx, choiceIdx) => {
    setChoiceAnswers(prev => ({
      ...prev,
      [`${conceptId}-${exampleIdx}`]: choiceIdx
    }))
  }

  const handleNextExample = () => {
    if (currentExample < examples.length - 1) {
      setCurrentExample(currentExample + 1)
    } else {
      // Mark concept as completed
      if (!completedConcepts.includes(currentConcept)) {
        setCompletedConcepts([...completedConcepts, currentConcept])
      }
      // Move to next concept or practice
      if (currentConcept < concepts.length - 1) {
        setCurrentConcept(currentConcept + 1)
        setCurrentExample(0)
      }
    }
  }

  const handlePracticeAnswer = (questionId, answer) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const calculatePracticeScore = () => {
    let correct = 0
    practiceQuestions.forEach(q => {
      if (q.type === 'multiple_choice' && practiceAnswers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const renderInteractiveElement = (interactive, conceptId, exampleIdx) => {
    const key = `${conceptId}-${exampleIdx}`

    if (interactive.type === 'reveal') {
      const isRevealed = revealedAnswers[key]
      return (
        <div className="mt-4 p-4 bg-kinesthetic-50 rounded-lg">
          <p className="font-medium text-kinesthetic-700 mb-3">{interactive.question}</p>
          {isRevealed ? (
            <div className="bg-white p-3 rounded border-l-4 border-kinesthetic">
              <p className="text-navy-700">{interactive.answer}</p>
            </div>
          ) : (
            <button
              onClick={() => handleReveal(conceptId, exampleIdx)}
              className="px-4 py-2 bg-kinesthetic text-white rounded-lg hover:bg-kinesthetic-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Click to Reveal Answer
            </button>
          )}
        </div>
      )
    }

    if (interactive.type === 'choice') {
      const selectedChoice = choiceAnswers[key]
      const isAnswered = selectedChoice !== undefined

      return (
        <div className="mt-4 p-4 bg-kinesthetic-50 rounded-lg">
          <p className="font-medium text-kinesthetic-700 mb-3">{interactive.question}</p>
          <div className="space-y-2">
            {interactive.options.map((option, idx) => {
              const isSelected = selectedChoice === idx
              const isCorrect = idx === interactive.correctIndex
              const showResult = isAnswered

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswered && handleChoice(conceptId, exampleIdx, idx)}
                  disabled={isAnswered}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    showResult && isCorrect
                      ? 'border-kinesthetic bg-kinesthetic-50 text-kinesthetic-700'
                      : showResult && isSelected && !isCorrect
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : isSelected
                      ? 'border-kinesthetic bg-kinesthetic-100'
                      : 'border-navy-200 hover:border-kinesthetic-300 hover:bg-white'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                      showResult && isCorrect
                        ? 'bg-kinesthetic text-white'
                        : showResult && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : 'bg-navy-200'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
          {isAnswered && (
            <div className={`mt-3 p-3 rounded-lg ${selectedChoice === interactive.correctIndex ? 'bg-kinesthetic-100' : 'bg-gold-100'}`}>
              <p className="text-sm">
                <strong>{selectedChoice === interactive.correctIndex ? 'Correct!' : 'Not quite.'}</strong> {interactive.explanation}
              </p>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  // LEARN PHASE
  if (phase === 'learn') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-kinesthetic-50 rounded-full mb-2">
            <span className="w-2 h-2 bg-kinesthetic rounded-full"></span>
            <span className="text-kinesthetic-700 text-sm font-medium">Kinesthetic Learning</span>
          </div>
          <h2 className="text-xl font-bold text-navy-800 font-heading">{data.title || 'Interactive Learning'}</h2>
          <p className="text-navy-500 mt-1">{data.introduction}</p>
        </div>

        {/* Phase Toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPhase('learn')}
            className="px-4 py-2 bg-kinesthetic text-white rounded-lg font-medium"
          >
            Learn
          </button>
          <button
            onClick={() => setPhase('practice')}
            className={`px-4 py-2 rounded-lg font-medium ${
              completedConcepts.length > 0
                ? 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                : 'bg-navy-50 text-navy-300 cursor-not-allowed'
            }`}
            disabled={completedConcepts.length === 0}
          >
            Practice {completedConcepts.length > 0 && `(${completedConcepts.length}/${concepts.length} concepts)`}
          </button>
        </div>

        {/* Concept Progress */}
        <div className="flex items-center gap-2">
          {concepts.map((c, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentConcept(idx)
                setCurrentExample(0)
              }}
              className={`flex-1 h-2 rounded-full transition-colors ${
                idx === currentConcept
                  ? 'bg-kinesthetic'
                  : completedConcepts.includes(idx)
                  ? 'bg-kinesthetic-300'
                  : 'bg-navy-200'
              }`}
            />
          ))}
        </div>

        {/* Current Concept */}
        <div className="bg-white border border-navy-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-kinesthetic">
              Concept {currentConcept + 1} of {concepts.length}
            </span>
            <span className="text-xs px-2 py-1 bg-kinesthetic-100 text-kinesthetic-700 rounded-full">
              Example {currentExample + 1} of {examples.length}
            </span>
          </div>

          <h3 className="text-lg font-bold text-navy-800 font-heading mb-2">{concept.title}</h3>
          <p className="text-navy-600 mb-4">{concept.explanation}</p>

          <div className="bg-gold-50 border-l-4 border-gold p-3 mb-6">
            <p className="text-sm text-gold-500">
              <strong>Key Point:</strong> {concept.keyPoint}
            </p>
          </div>

          {/* Current Example */}
          {example && (
            <div className="bg-navy-50 rounded-lg p-4">
              <h4 className="font-semibold text-navy-800 mb-2">{example.title}</h4>
              <div className="bg-white p-3 rounded border border-navy-100 mb-3">
                <p className="text-navy-700 italic">{example.scenario}</p>
              </div>
              <p className="text-navy-600 mb-2">{example.walkthrough}</p>

              {example.interactive && renderInteractiveElement(example.interactive, concept.id, currentExample)}
            </div>
          )}

          {/* Fun Fact */}
          {concept.funFact && currentExample === examples.length - 1 && (
            <div className="mt-4 bg-gradient-to-r from-kinesthetic-50 to-audio-50 p-4 rounded-lg">
              <p className="text-sm">
                <span className="text-kinesthetic font-medium">Fun Fact:</span>{' '}
                <span className="text-navy-700">{concept.funFact}</span>
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                if (currentExample > 0) {
                  setCurrentExample(currentExample - 1)
                } else if (currentConcept > 0) {
                  setCurrentConcept(currentConcept - 1)
                  setCurrentExample(concepts[currentConcept - 1].examples.length - 1)
                }
              }}
              disabled={currentConcept === 0 && currentExample === 0}
              className="px-4 py-2 text-navy-500 hover:text-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentConcept === concepts.length - 1 && currentExample === examples.length - 1 ? (
              <button
                onClick={() => {
                  if (!completedConcepts.includes(currentConcept)) {
                    setCompletedConcepts([...completedConcepts, currentConcept])
                  }
                  setPhase('practice')
                }}
                className="px-6 py-2 bg-kinesthetic text-white rounded-lg hover:bg-kinesthetic-600 transition-colors"
              >
                Start Practice
              </button>
            ) : (
              <button
                onClick={handleNextExample}
                className="px-4 py-2 bg-kinesthetic text-white rounded-lg hover:bg-kinesthetic-600 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // PRACTICE PHASE
  if (showPracticeResults) {
    const score = calculatePracticeScore()
    const total = practiceQuestions.filter(q => q.type === 'multiple_choice').length
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy-800 font-heading">Practice Complete!</h2>
        </div>

        <div className="bg-gradient-to-r from-kinesthetic to-kinesthetic-600 rounded-xl p-8 text-white text-center">
          <div className="text-6xl font-bold mb-2">{percentage}%</div>
          <div className="text-xl opacity-90">
            {score} out of {total} correct
          </div>
        </div>

        <div className="space-y-4">
          {practiceQuestions.map((q, idx) => {
            const userAnswer = practiceAnswers[q.id]
            const isCorrect = q.type === 'multiple_choice' && userAnswer === q.correctAnswer

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  isCorrect ? 'border-kinesthetic bg-kinesthetic-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-sm ${
                    isCorrect ? 'bg-kinesthetic' : 'bg-red-500'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-medium text-navy-800">{q.question}</p>
                    {q.scenario && <p className="text-sm text-navy-600 mt-1 italic">{q.scenario}</p>}
                    <p className="text-sm text-navy-600 mt-2">{q.explanation}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setPhase('learn')
              setCurrentConcept(0)
              setCurrentExample(0)
            }}
            className="flex-1 py-3 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition-colors font-medium"
          >
            Review Concepts
          </button>
          <button
            onClick={() => {
              setPracticeAnswers({})
              setShowPracticeResults(false)
            }}
            className="flex-1 py-3 bg-kinesthetic text-white rounded-lg hover:bg-kinesthetic-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Practice Questions
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-kinesthetic-50 rounded-full mb-2">
          <span className="w-2 h-2 bg-kinesthetic rounded-full"></span>
          <span className="text-kinesthetic-700 text-sm font-medium">Kinesthetic Learning</span>
        </div>
        <h2 className="text-xl font-bold text-navy-800 font-heading">Practice Time!</h2>
        <p className="text-navy-500 mt-1">Apply what you've learned with new scenarios</p>
      </div>

      {/* Phase Toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setPhase('learn')}
          className="px-4 py-2 bg-navy-100 text-navy-700 rounded-lg font-medium hover:bg-navy-200"
        >
          Learn
        </button>
        <button
          onClick={() => setPhase('practice')}
          className="px-4 py-2 bg-kinesthetic text-white rounded-lg font-medium"
        >
          Practice
        </button>
      </div>

      {/* Practice Questions */}
      <div className="space-y-4">
        {practiceQuestions.map((question, idx) => (
          <div key={idx} className="bg-white border border-navy-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-kinesthetic">Question {idx + 1}</span>
              {question.type === 'apply' && (
                <span className="text-xs px-2 py-1 bg-readwrite-100 text-readwrite-700 rounded-full">Application</span>
              )}
            </div>

            {question.scenario && (
              <div className="bg-navy-50 p-3 rounded-lg mb-3 italic text-navy-700">
                {question.scenario}
              </div>
            )}

            <p className="font-medium text-navy-800 mb-4">{question.question}</p>

            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options.map((option, optIdx) => {
                  const isSelected = practiceAnswers[question.id] === optIdx

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handlePracticeAnswer(question.id, optIdx)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-kinesthetic bg-kinesthetic-50'
                          : 'border-navy-200 hover:border-kinesthetic-300 hover:bg-navy-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                          isSelected ? 'bg-kinesthetic text-white' : 'bg-navy-200'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {question.type === 'apply' && (
              <div className="space-y-3">
                <div className="bg-audio-50 p-4 rounded-lg">
                  <p className="text-sm text-audio-700">
                    <strong>Think about it:</strong> What approach would you take?
                  </p>
                </div>
                <button
                  onClick={() => handlePracticeAnswer(question.id, 'revealed')}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    practiceAnswers[question.id]
                      ? 'border-kinesthetic bg-kinesthetic-50'
                      : 'border-navy-200 hover:border-kinesthetic-300'
                  }`}
                >
                  {practiceAnswers[question.id] ? (
                    <div className="text-left">
                      <p className="font-medium text-kinesthetic-700 mb-2">Correct Approach:</p>
                      <p className="text-navy-700">{question.correctApproach}</p>
                      {question.commonMistakes && (
                        <div className="mt-3 pt-3 border-t border-kinesthetic-200">
                          <p className="text-sm text-gold-500 font-medium">Common Mistakes:</p>
                          <ul className="list-disc list-inside text-sm text-navy-600 mt-1">
                            {question.commonMistakes.map((mistake, i) => (
                              <li key={i}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-navy-500">Click to reveal the correct approach</span>
                  )}
                </button>
              </div>
            )}

            {question.hint && !practiceAnswers[question.id] && (
              <p className="text-sm text-navy-400 mt-3">
                <strong>Hint:</strong> {question.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={() => setShowPracticeResults(true)}
        disabled={Object.keys(practiceAnswers).length < practiceQuestions.length}
        className="w-full py-3 bg-kinesthetic text-white rounded-lg hover:bg-kinesthetic-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Check My Answers
      </button>
    </div>
  )
}

export default InteractiveTab
