import { useState } from 'react'
import RerunControl from './RerunControl'

function InteractiveTab({ data, rerunState, onRerun, onVersionChange }) {
  const [phase, setPhase] = useState('learn') // 'learn' or 'practice'
  const [currentConcept, setCurrentConcept] = useState(0)
  const [currentExample, setCurrentExample] = useState(0)
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [choiceAnswers, setChoiceAnswers] = useState({})
  const [practiceAnswers, setPracticeAnswers] = useState({})
  const [showPracticeResults, setShowPracticeResults] = useState(false)
  const [completedConcepts, setCompletedConcepts] = useState([])

  // Determine which content to display based on active version
  const getDisplayData = () => {
    if (!rerunState || rerunState.activeVersion === 0 || !rerunState.versions?.length) {
      return data
    }
    const versionIndex = rerunState.activeVersion - 1
    return rerunState.versions[versionIndex]?.data || data
  }

  const displayData = getDisplayData()

  if (!displayData || !displayData.concepts || displayData.concepts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No interactive content available
      </div>
    )
  }

  const concepts = displayData.concepts
  const practiceQuestions = displayData.practiceQuestions || []
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
        <div className="mt-4 p-4 bg-kinesthetic/10 rounded-xl border border-kinesthetic/20">
          <p className="font-medium text-kinesthetic mb-3">{interactive.question}</p>
          {isRevealed ? (
            <div className="bg-dark-200 p-4 rounded-xl border-l-4 border-kinesthetic shadow-kinesthetic-glow">
              <p className="text-gray-200">{interactive.answer}</p>
            </div>
          ) : (
            <button
              onClick={() => handleReveal(conceptId, exampleIdx)}
              className="px-6 py-3 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl hover:shadow-kinesthetic-glow transition-all duration-300 flex items-center gap-2 font-semibold hover:scale-105"
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
        <div className="mt-4 p-4 bg-kinesthetic/10 rounded-xl border border-kinesthetic/20">
          <p className="font-medium text-kinesthetic mb-3">{interactive.question}</p>
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
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                    showResult && isCorrect
                      ? 'border-kinesthetic bg-kinesthetic/20 text-kinesthetic shadow-kinesthetic-glow'
                      : showResult && isSelected && !isCorrect
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : isSelected
                      ? 'border-kinesthetic bg-kinesthetic/10 text-white'
                      : 'border-gray-600 hover:border-kinesthetic/50 hover:bg-kinesthetic/5 text-gray-300'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                      showResult && isCorrect
                        ? 'bg-kinesthetic text-white shadow-kinesthetic-glow'
                        : showResult && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-kinesthetic/50 text-white'
                        : 'bg-dark-300 text-gray-400'
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
            <div className={`mt-3 p-4 rounded-xl ${selectedChoice === interactive.correctIndex ? 'bg-kinesthetic/20 border border-kinesthetic/30' : 'bg-gold/20 border border-gold/30'}`}>
              <p className="text-sm text-gray-200">
                <strong className={selectedChoice === interactive.correctIndex ? 'text-kinesthetic' : 'text-gold'}>{selectedChoice === interactive.correctIndex ? 'Correct!' : 'Not quite.'}</strong> {interactive.explanation}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kinesthetic/20 rounded-full mb-2 border border-kinesthetic/30">
            <span className="w-2 h-2 bg-kinesthetic rounded-full shadow-kinesthetic-glow"></span>
            <span className="text-kinesthetic text-sm font-medium">Kinesthetic Learning</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">{displayData.title || 'Interactive Learning'}</h2>
          <p className="text-gray-400 mt-1">{displayData.introduction}</p>
        </div>

        {/* Rerun Control */}
        <RerunControl
          color="kinesthetic"
          rerunState={rerunState}
          onRerun={onRerun}
          onVersionChange={onVersionChange}
        />

        {/* Phase Toggle */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setPhase('learn')}
            className="px-6 py-3 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl font-semibold shadow-kinesthetic-glow"
          >
            Learn
          </button>
          <button
            onClick={() => setPhase('practice')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              completedConcepts.length > 0
                ? 'bg-dark-200 text-gray-300 hover:bg-dark-300 border border-kinesthetic/30 hover:border-kinesthetic/50'
                : 'bg-dark-300 text-gray-500 cursor-not-allowed border border-white/5'
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
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                idx === currentConcept
                  ? 'bg-kinesthetic shadow-kinesthetic-glow'
                  : completedConcepts.includes(idx)
                  ? 'bg-kinesthetic/50'
                  : 'bg-dark-300'
              }`}
            />
          ))}
        </div>

        {/* Current Concept */}
        <div className="bg-dark-100 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-kinesthetic">
              Concept {currentConcept + 1} of {concepts.length}
            </span>
            <span className="text-xs px-3 py-1.5 bg-kinesthetic/20 text-kinesthetic rounded-full border border-kinesthetic/30">
              Example {currentExample + 1} of {examples.length}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white font-heading mb-2">{concept.title}</h3>
          <p className="text-gray-300 mb-4">{concept.explanation}</p>

          <div className="bg-gold/10 border-l-4 border-gold p-4 mb-6 rounded-r-xl">
            <p className="text-sm text-gold">
              <strong>Key Point:</strong> {concept.keyPoint}
            </p>
          </div>

          {/* Current Example */}
          {example && (
            <div className="bg-dark-200 rounded-xl p-4 border border-white/5">
              <h4 className="font-semibold text-white mb-2">{example.title}</h4>
              <div className="bg-dark-100 p-4 rounded-xl border border-white/10 mb-3">
                <p className="text-gray-300 italic">{example.scenario}</p>
              </div>
              <p className="text-gray-400 mb-2">{example.walkthrough}</p>

              {example.interactive && renderInteractiveElement(example.interactive, concept.id, currentExample)}
            </div>
          )}

          {/* Fun Fact */}
          {concept.funFact && currentExample === examples.length - 1 && (
            <div className="mt-4 bg-gradient-to-r from-kinesthetic/10 to-audio/10 p-4 rounded-xl border border-kinesthetic/20">
              <p className="text-sm">
                <span className="text-kinesthetic font-medium">Fun Fact:</span>{' '}
                <span className="text-gray-300">{concept.funFact}</span>
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
              className="px-5 py-2.5 text-gray-400 hover:text-white bg-dark-200 hover:bg-dark-300 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
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
                className="px-6 py-2.5 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl font-semibold hover:shadow-kinesthetic-glow transition-all duration-300 hover:scale-105"
              >
                Start Practice
              </button>
            ) : (
              <button
                onClick={handleNextExample}
                className="px-6 py-2.5 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl font-semibold hover:shadow-kinesthetic-glow transition-all duration-300 hover:scale-105"
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
          <h2 className="text-2xl font-bold text-white font-heading">Practice Complete!</h2>
        </div>

        <div className="bg-gradient-to-r from-kinesthetic to-kinesthetic-600 rounded-2xl p-8 text-white text-center shadow-kinesthetic-glow">
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
                className={`p-4 rounded-xl border-l-4 ${
                  isCorrect ? 'border-kinesthetic bg-kinesthetic/10' : 'border-red-500 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-white text-sm font-bold ${
                    isCorrect ? 'bg-kinesthetic shadow-kinesthetic-glow' : 'bg-red-500'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-medium text-white">{q.question}</p>
                    {q.scenario && <p className="text-sm text-gray-400 mt-1 italic">{q.scenario}</p>}
                    <p className="text-sm text-gray-300 mt-2">{q.explanation}</p>
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
            className="flex-1 py-3 bg-dark-200 text-gray-300 rounded-xl hover:bg-dark-300 transition-all duration-300 font-semibold border border-white/10 hover:border-white/20"
          >
            Review Concepts
          </button>
          <button
            onClick={() => {
              setPracticeAnswers({})
              setShowPracticeResults(false)
            }}
            className="flex-1 py-3 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl hover:shadow-kinesthetic-glow transition-all duration-300 font-semibold hover:scale-[1.02]"
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-kinesthetic/20 rounded-full mb-2 border border-kinesthetic/30">
          <span className="w-2 h-2 bg-kinesthetic rounded-full shadow-kinesthetic-glow"></span>
          <span className="text-kinesthetic text-sm font-medium">Kinesthetic Learning</span>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Practice Time!</h2>
        <p className="text-gray-400 mt-1">Apply what you've learned with new scenarios</p>
      </div>

      {/* Rerun Control */}
      <RerunControl
        color="kinesthetic"
        rerunState={rerunState}
        onRerun={onRerun}
        onVersionChange={onVersionChange}
      />

      {/* Phase Toggle */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setPhase('learn')}
          className="px-6 py-3 bg-dark-200 text-gray-300 rounded-xl font-semibold hover:bg-dark-300 transition-all duration-300 border border-white/10 hover:border-white/20"
        >
          Learn
        </button>
        <button
          onClick={() => setPhase('practice')}
          className="px-6 py-3 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl font-semibold shadow-kinesthetic-glow"
        >
          Practice
        </button>
      </div>

      {/* Practice Questions */}
      <div className="space-y-4">
        {practiceQuestions.map((question, idx) => (
          <div key={idx} className="bg-dark-100 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-kinesthetic">Question {idx + 1}</span>
              {question.type === 'apply' && (
                <span className="text-xs px-3 py-1 bg-readwrite/20 text-readwrite rounded-full border border-readwrite/30">Application</span>
              )}
            </div>

            {question.scenario && (
              <div className="bg-dark-200 p-4 rounded-xl mb-3 italic text-gray-300 border border-white/5">
                {question.scenario}
              </div>
            )}

            <p className="font-medium text-white mb-4">{question.question}</p>

            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options.map((option, optIdx) => {
                  const isSelected = practiceAnswers[question.id] === optIdx

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handlePracticeAnswer(question.id, optIdx)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                        isSelected
                          ? 'border-kinesthetic bg-kinesthetic/20 text-white shadow-kinesthetic-glow'
                          : 'border-gray-600 hover:border-kinesthetic/50 hover:bg-kinesthetic/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                          isSelected ? 'bg-kinesthetic text-white shadow-kinesthetic-glow' : 'bg-dark-300 text-gray-400'
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
                <div className="bg-audio/10 p-4 rounded-xl border border-audio/20">
                  <p className="text-sm text-audio">
                    <strong>Think about it:</strong> What approach would you take?
                  </p>
                </div>
                <button
                  onClick={() => handlePracticeAnswer(question.id, 'revealed')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    practiceAnswers[question.id]
                      ? 'border-kinesthetic bg-kinesthetic/10'
                      : 'border-gray-600 hover:border-kinesthetic/50 hover:bg-kinesthetic/5'
                  }`}
                >
                  {practiceAnswers[question.id] ? (
                    <div className="text-left">
                      <p className="font-medium text-kinesthetic mb-2">Correct Approach:</p>
                      <p className="text-gray-300">{question.correctApproach}</p>
                      {question.commonMistakes && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-sm text-gold font-medium">Common Mistakes:</p>
                          <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                            {question.commonMistakes.map((mistake, i) => (
                              <li key={i}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Click to reveal the correct approach</span>
                  )}
                </button>
              </div>
            )}

            {question.hint && !practiceAnswers[question.id] && (
              <p className="text-sm text-gray-500 mt-3">
                <strong className="text-gray-400">Hint:</strong> {question.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={() => setShowPracticeResults(true)}
        disabled={Object.keys(practiceAnswers).length < practiceQuestions.length}
        className="w-full py-4 bg-gradient-to-r from-kinesthetic to-kinesthetic-600 text-white rounded-xl hover:shadow-kinesthetic-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg hover:scale-[1.02]"
      >
        Check My Answers
      </button>
    </div>
  )
}

export default InteractiveTab
