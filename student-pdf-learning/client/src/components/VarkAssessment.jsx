import { useState } from 'react'

const QUESTIONS = [
  {
    question: "When learning something new, I prefer to:",
    options: [
      { text: "Watch a demonstration or video", type: "V" },
      { text: "Listen to someone explain it", type: "A" },
      { text: "Read instructions or written guides", type: "R" },
      { text: "Try it out myself hands-on", type: "K" }
    ]
  },
  {
    question: "When I need directions to a new place, I prefer:",
    options: [
      { text: "A map or diagram", type: "V" },
      { text: "Verbal directions from someone", type: "A" },
      { text: "Written step-by-step instructions", type: "R" },
      { text: "Following someone or walking the route first", type: "K" }
    ]
  },
  {
    question: "When studying for an exam, I usually:",
    options: [
      { text: "Use diagrams, charts, and color-coded notes", type: "V" },
      { text: "Record and listen to lectures or discuss with others", type: "A" },
      { text: "Read textbooks and write detailed notes", type: "R" },
      { text: "Practice problems and create flashcards to handle", type: "K" }
    ]
  },
  {
    question: "I remember things best when I:",
    options: [
      { text: "See pictures, graphs, or visualizations", type: "V" },
      { text: "Hear them spoken or explained aloud", type: "A" },
      { text: "Write them down or read them multiple times", type: "R" },
      { text: "Do something physical while learning", type: "K" }
    ]
  },
  {
    question: "When explaining something to someone, I tend to:",
    options: [
      { text: "Draw a picture or show them visually", type: "V" },
      { text: "Talk it through and explain verbally", type: "A" },
      { text: "Write it down or give them something to read", type: "R" },
      { text: "Demonstrate by doing it with them", type: "K" }
    ]
  },
  {
    question: "In a classroom, I learn best when the teacher:",
    options: [
      { text: "Uses slides, videos, and visual aids", type: "V" },
      { text: "Lectures and encourages discussions", type: "A" },
      { text: "Provides handouts and reading materials", type: "R" },
      { text: "Includes activities and hands-on exercises", type: "K" }
    ]
  },
  {
    question: "When I'm bored, I tend to:",
    options: [
      { text: "Doodle, look around, or watch something", type: "V" },
      { text: "Hum, talk to myself, or listen to music", type: "A" },
      { text: "Read a book or browse articles", type: "R" },
      { text: "Fidget, walk around, or do something with my hands", type: "K" }
    ]
  },
  {
    question: "When assembling furniture or a new gadget, I:",
    options: [
      { text: "Look at the pictures and diagrams first", type: "V" },
      { text: "Ask someone to explain or watch a tutorial", type: "A" },
      { text: "Read the instruction manual carefully", type: "R" },
      { text: "Start putting it together and figure it out as I go", type: "K" }
    ]
  },
  {
    question: "When choosing a restaurant, I prefer to:",
    options: [
      { text: "Look at photos of the food and atmosphere", type: "V" },
      { text: "Ask friends for recommendations", type: "A" },
      { text: "Read online reviews and descriptions", type: "R" },
      { text: "Visit and try the food myself", type: "K" }
    ]
  },
  {
    question: "When I need to concentrate, I:",
    options: [
      { text: "Need a visually clean and organized space", type: "V" },
      { text: "Need quiet or specific background music", type: "A" },
      { text: "Need my notes and materials organized", type: "R" },
      { text: "Need to move around or have something to fidget with", type: "K" }
    ]
  }
]

const VARK_INFO = {
  V: {
    name: "Visual",
    color: "visual",
    description: "You learn best through seeing and visualizing. Charts, diagrams, maps, and videos help you understand and remember information.",
    tips: [
      "Use color-coded notes and highlighters",
      "Create mind maps and diagrams",
      "Watch educational videos",
      "Use flashcards with images"
    ]
  },
  A: {
    name: "Auditory",
    color: "audio",
    description: "You learn best through listening and discussing. Lectures, podcasts, and verbal explanations help you grasp concepts.",
    tips: [
      "Record lectures and listen to them again",
      "Discuss topics with study groups",
      "Use text-to-speech for reading materials",
      "Explain concepts out loud to yourself"
    ]
  },
  R: {
    name: "Read/Write",
    color: "readwrite",
    description: "You learn best through reading and writing. Textbooks, articles, and note-taking are your strongest learning tools.",
    tips: [
      "Take detailed written notes",
      "Rewrite notes in your own words",
      "Read textbooks and articles thoroughly",
      "Create written summaries and lists"
    ]
  },
  K: {
    name: "Kinesthetic",
    color: "kinesthetic",
    description: "You learn best through hands-on experience. Practical exercises, experiments, and physical activities enhance your learning.",
    tips: [
      "Practice with real examples",
      "Take breaks to move around while studying",
      "Use hands-on activities and simulations",
      "Create physical models or role-play scenarios"
    ]
  }
}

function VarkAssessment({ onBack }) {
  const [stage, setStage] = useState('intro') // 'intro', 'quiz', 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState(null)

  const handleStart = () => {
    setStage('quiz')
    setCurrentQuestion(0)
    setAnswers([])
  }

  const handleAnswer = (type) => {
    const newAnswers = [...answers, type]
    setAnswers(newAnswers)

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate results
      const scores = { V: 0, A: 0, R: 0, K: 0 }
      newAnswers.forEach(answer => scores[answer]++)

      const total = newAnswers.length
      const percentages = {
        V: Math.round((scores.V / total) * 100),
        A: Math.round((scores.A / total) * 100),
        R: Math.round((scores.R / total) * 100),
        K: Math.round((scores.K / total) * 100)
      }

      // Find primary style(s)
      const maxScore = Math.max(...Object.values(percentages))
      const primaryStyles = Object.keys(percentages).filter(key => percentages[key] === maxScore)

      setResults({ percentages, primaryStyles, scores })
      setStage('results')
    }
  }

  const handleRetake = () => {
    setStage('intro')
    setCurrentQuestion(0)
    setAnswers([])
    setResults(null)
  }

  const getBarColor = (type) => {
    const colors = {
      V: 'bg-visual',
      A: 'bg-audio',
      R: 'bg-readwrite',
      K: 'bg-kinesthetic'
    }
    return colors[type]
  }

  const getGlowClass = (type) => {
    const glows = {
      V: 'shadow-visual-glow',
      A: 'shadow-audio-glow',
      R: 'shadow-readwrite-glow',
      K: 'shadow-kinesthetic-glow'
    }
    return glows[type]
  }

  return (
    <div className="card-glow p-8">
      {/* Intro Stage */}
      {stage === 'intro' && (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-visual/20 via-audio/20 to-kinesthetic/20 rounded-2xl">
              <svg className="w-16 h-16 text-visual" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white font-heading mb-2">
              Discover Your Learning Style
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Take this quick 10-question assessment to find out if you're a Visual, Auditory,
              Read/Write, or Kinesthetic learner. Understanding your learning style can help you
              study more effectively!
            </p>
          </div>

          {/* VARK Preview */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {Object.entries(VARK_INFO).map(([key, info]) => (
              <div
                key={key}
                className={`p-3 rounded-xl bg-${info.color}/10 border border-${info.color}/30 text-left`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full bg-${info.color} ${getGlowClass(key)}`}></span>
                  <span className={`font-medium text-${info.color}`}>{info.name}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{info.description.split('.')[0]}.</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-r from-visual via-audio to-kinesthetic text-white rounded-xl font-bold text-lg hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
          >
            Start Assessment
          </button>
        </div>
      )}

      {/* Quiz Stage */}
      {stage === 'quiz' && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span className="font-medium text-visual">{Math.round(((currentQuestion) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-visual via-audio via-readwrite to-kinesthetic h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="py-4">
            <h3 className="text-xl font-semibold text-white font-heading mb-6">
              {QUESTIONS[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {QUESTIONS[currentQuestion].options.map((option, index) => {
                const colors = ['visual', 'audio', 'readwrite', 'kinesthetic']
                const color = colors[index]
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.type)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 border-gray-600 hover:border-${color}/50 hover:bg-${color}/10 hover:shadow-${color}-glow group`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg bg-dark-300 group-hover:bg-${color}/20 flex items-center justify-center text-gray-400 group-hover:text-${color} font-medium transition-all`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {option.text}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question dots */}
          <div className="flex justify-center gap-2">
            {QUESTIONS.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index < currentQuestion
                    ? 'bg-visual'
                    : index === currentQuestion
                    ? 'bg-visual w-4'
                    : 'bg-dark-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results Stage */}
      {stage === 'results' && results && (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white font-heading mb-2">
              Your Learning Style Results
            </h2>
            <p className="text-gray-400">
              Based on your answers, here's your VARK learning style breakdown
            </p>
          </div>

          {/* Percentage Bars */}
          <div className="space-y-4">
            {Object.entries(results.percentages)
              .sort(([, a], [, b]) => b - a)
              .map(([type, percentage]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getBarColor(type)} ${getGlowClass(type)}`}></span>
                      <span className={`font-medium text-${VARK_INFO[type].color}`}>
                        {VARK_INFO[type].name}
                      </span>
                      {results.primaryStyles.includes(type) && (
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${VARK_INFO[type].color}/20 text-${VARK_INFO[type].color}`}>
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-white">{percentage}%</span>
                  </div>
                  <div className="w-full bg-dark-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`${getBarColor(type)} h-4 rounded-full transition-all duration-1000 ${getGlowClass(type)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Primary Style Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white font-heading">
              {results.primaryStyles.length > 1 ? 'Your Primary Styles' : 'Your Primary Style'}
            </h3>
            {results.primaryStyles.map(type => (
              <div
                key={type}
                className={`p-5 rounded-xl bg-${VARK_INFO[type].color}/10 border border-${VARK_INFO[type].color}/30`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-4 h-4 rounded-full bg-${VARK_INFO[type].color} ${getGlowClass(type)}`}></span>
                  <h4 className={`text-lg font-bold text-${VARK_INFO[type].color}`}>
                    {VARK_INFO[type].name} Learner
                  </h4>
                </div>
                <p className="text-gray-300 mb-4">{VARK_INFO[type].description}</p>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Study Tips:</p>
                  <ul className="space-y-1">
                    {VARK_INFO[type].tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`text-${VARK_INFO[type].color} mt-1`}>•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetake}
              className="px-6 py-3 rounded-xl border-2 border-gray-600 text-gray-300 hover:border-visual/50 hover:text-visual hover:bg-visual/10 transition-all duration-300 font-medium"
            >
              Retake Assessment
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-visual via-audio to-kinesthetic text-white rounded-xl font-medium hover:shadow-glow-lg transition-all duration-300"
            >
              Back to Learning
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VarkAssessment
