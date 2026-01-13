import { useState } from 'react'

function InteractiveTab({ quiz }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [fillBlankInput, setFillBlankInput] = useState('')

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No quiz available
      </div>
    )
  }

  const questions = quiz.questions
  const question = questions[currentQuestion]

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer })
    setShowHint(false)
    setFillBlankInput('')
  }

  const isAnswered = answers[currentQuestion] !== undefined
  const isCorrect = () => {
    const answer = answers[currentQuestion]
    if (question.type === 'multiple_choice') {
      return answer === question.correctAnswer
    } else if (question.type === 'true_false') {
      return answer === question.correctAnswer
    } else if (question.type === 'fill_blank') {
      return answer?.toLowerCase().trim() === question.answer?.toLowerCase().trim()
    }
    return false
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      const answer = answers[index]
      if (q.type === 'multiple_choice' && answer === q.correctAnswer) correct++
      else if (q.type === 'true_false' && answer === q.correctAnswer) correct++
      else if (q.type === 'fill_blank' && answer?.toLowerCase().trim() === q.answer?.toLowerCase().trim()) correct++
    })
    return correct
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === index
              const showCorrect = isAnswered && index === question.correctAnswer
              const showWrong = isAnswered && isSelected && index !== question.correctAnswer

              return (
                <button
                  key={index}
                  onClick={() => !isAnswered && handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : showWrong
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-medium ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'true_false':
        return (
          <div className="flex gap-4 justify-center">
            {[true, false].map((value) => {
              const isSelected = answers[currentQuestion] === value
              const showCorrect = isAnswered && value === question.correctAnswer
              const showWrong = isAnswered && isSelected && value !== question.correctAnswer

              return (
                <button
                  key={String(value)}
                  onClick={() => !isAnswered && handleAnswer(value)}
                  disabled={isAnswered}
                  className={`px-8 py-4 rounded-lg border-2 font-medium transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : showWrong
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {value ? 'True' : 'False'}
                </button>
              )
            })}
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={fillBlankInput}
                onChange={(e) => setFillBlankInput(e.target.value)}
                disabled={isAnswered}
                placeholder="Type your answer..."
                className="flex-1 p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && fillBlankInput.trim()) {
                    handleAnswer(fillBlankInput)
                  }
                }}
              />
              <button
                onClick={() => fillBlankInput.trim() && handleAnswer(fillBlankInput)}
                disabled={isAnswered || !fillBlankInput.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>
            {isAnswered && (
              <div className={`p-3 rounded-lg ${isCorrect() ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {isCorrect() ? 'Correct!' : `The answer is: ${question.answer}`}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <div className="text-6xl font-bold mb-2">{percentage}%</div>
          <div className="text-xl opacity-90">
            {score} out of {questions.length} correct
          </div>
        </div>

        <div className="grid gap-4">
          {questions.map((q, index) => {
            const answer = answers[index]
            let correct = false
            if (q.type === 'multiple_choice') correct = answer === q.correctAnswer
            else if (q.type === 'true_false') correct = answer === q.correctAnswer
            else if (q.type === 'fill_blank') correct = answer?.toLowerCase().trim() === q.answer?.toLowerCase().trim()

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-sm ${
                    correct ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{q.question}</p>
                    <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => {
            setAnswers({})
            setCurrentQuestion(0)
            setShowResults(false)
          }}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">{quiz.title || 'Knowledge Check'}</h2>
        <p className="text-gray-600 mt-1">Test your understanding</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full transition-colors ${
              index < currentQuestion
                ? answers[index] !== undefined
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                : index === currentQuestion
                ? 'bg-indigo-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-indigo-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            question.type === 'multiple_choice'
              ? 'bg-blue-100 text-blue-700'
              : question.type === 'true_false'
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {question.type === 'multiple_choice' ? 'Multiple Choice' : question.type === 'true_false' ? 'True/False' : 'Fill in the Blank'}
          </span>
        </div>

        <h3 className="text-lg font-medium text-gray-800 mb-6">
          {question.question}
        </h3>

        {renderQuestion()}

        {/* Explanation */}
        {isAnswered && question.explanation && (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect() ? 'bg-green-50' : 'bg-amber-50'}`}>
            <p className={`text-sm ${isCorrect() ? 'text-green-800' : 'text-amber-800'}`}>
              <strong>{isCorrect() ? 'Correct!' : 'Not quite.'}</strong> {question.explanation}
            </p>
          </div>
        )}

        {/* Hint */}
        {!isAnswered && question.hint && (
          <div className="mt-4">
            {showHint ? (
              <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                <strong>Hint:</strong> {question.hint}
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Need a hint?
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={() => setShowResults(true)}
            disabled={Object.keys(answers).length !== questions.length}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            See Results
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}

export default InteractiveTab
