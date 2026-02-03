export default function QuestionTypeSelector({ config, onChange }) {
  const questionTypes = [
    { key: 'multipleChoice', label: 'Multiple Choice', description: '4 options (A, B, C, D)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { key: 'trueFalse', label: 'True/False', description: 'Simple true or false', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'shortAnswer', label: 'Short Answer', description: '1-2 sentence response', icon: 'M4 6h16M4 12h16m-7 6h7' },
    { key: 'essay', label: 'Essay', description: 'Paragraph response', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { key: 'fillInBlank', label: 'Fill in the Blank', description: 'Complete the sentence', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' }
  ]

  const handleChange = (key, value) => {
    const numValue = Math.max(0, Math.min(20, parseInt(value) || 0))
    onChange({ ...config, [key]: numValue })
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-adaptive">Question Types & Quantities</label>

      <div className="grid gap-3">
        {questionTypes.map(type => (
          <div
            key={type.key}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              config[type.key] > 0
                ? 'bg-readwrite/10 border-readwrite/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                config[type.key] > 0 ? 'bg-readwrite/20 text-readwrite' : 'bg-white/10 text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                </svg>
              </div>
              <div>
                <p className="font-medium text-adaptive">{type.label}</p>
                <p className="text-sm text-adaptive-secondary">{type.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange(type.key, config[type.key] - 1)}
                className="w-8 h-8 rounded-lg bg-white/10 text-adaptive hover:bg-white/20 transition-all flex items-center justify-center"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                max="20"
                value={config[type.key]}
                onChange={(e) => handleChange(type.key, e.target.value)}
                className="w-16 px-2 py-1 text-center rounded-lg bg-white/5 border border-white/10 text-adaptive focus:border-readwrite/50 focus:outline-none"
              />
              <button
                onClick={() => handleChange(type.key, config[type.key] + 1)}
                className="w-8 h-8 rounded-lg bg-white/10 text-adaptive hover:bg-white/20 transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
