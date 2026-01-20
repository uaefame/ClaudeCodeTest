import { useState } from 'react'

function RerunControl({
  color = 'visual',
  rerunState = {},
  onRerun,
  onVersionChange,
  hideOriginal = false
}) {
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [showInput, setShowInput] = useState(false)

  const { isLoading = false, versions = [], activeVersion = 0, error = null } = rerunState
  const hasVersions = versions && versions.length > 0

  const handleRerun = () => {
    if (onRerun) {
      onRerun(additionalInstructions)
    }
    setAdditionalInstructions('')
    setShowInput(false)
  }

  const handleVersionChange = (index) => {
    if (onVersionChange) {
      onVersionChange(index)
    }
  }

  return (
    <div className="space-y-4">
      {/* Version Toggle */}
      {hasVersions && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400 mr-2">Version:</span>

          {/* Only show Original button if there's original content */}
          {!hideOriginal && (
            <button
              onClick={() => handleVersionChange(0)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-300 ${
                activeVersion === 0
                  ? `bg-${color}/20 text-${color} border-${color}`
                  : 'bg-dark-200 text-gray-400 hover:bg-dark-300 border-transparent'
              }`}
            >
              Original
            </button>
          )}

          {versions.map((version, idx) => (
            <button
              key={version.id}
              onClick={() => handleVersionChange(idx + 1)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-300 ${
                activeVersion === idx + 1
                  ? `bg-${color}/20 text-${color} border-${color}`
                  : 'bg-dark-200 text-gray-400 hover:bg-dark-300 border-transparent'
              }`}
              title={version.instructions ? `Instructions: ${version.instructions}` : 'Regenerated version'}
            >
              V{idx + 2}
              {version.instructions && (
                <span className="ml-1 opacity-60">*</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Rerun Controls */}
      <div className="flex flex-col gap-3">
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : `hover:bg-${color}/30 hover:border-${color}/50`
            } bg-${color}/20 text-${color} border-${color}/30`}
          >
            {isLoading ? (
              <>
                <svg className={`w-5 h-5 animate-spin text-${color}`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerate</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-dark-100 rounded-xl border border-white/10">
            <label className="block text-sm text-gray-300">
              Additional instructions (optional):
            </label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="E.g., 'Make it more detailed', 'Focus on examples', 'Simplify the explanations'..."
              className={`w-full p-3 bg-dark-200 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none transition-all focus:ring-${color} focus:border-${color} focus:outline-none focus:ring-2`}
              rows={3}
              disabled={isLoading}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInput(false)
                  setAdditionalInstructions('')
                }}
                className="flex-1 px-4 py-2.5 bg-dark-200 text-gray-300 rounded-xl hover:bg-dark-300 transition-all duration-300 border border-white/10"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRerun}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-${color} to-${color}-600 text-white shadow-${color}-glow`}
              >
                {isLoading ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default RerunControl
