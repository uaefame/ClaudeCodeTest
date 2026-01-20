import RerunControl from './RerunControl'

function InfographicTab({ data, rerunState, onRerun, onVersionChange }) {
  // Determine which content to display based on active version
  const getDisplayData = () => {
    if (!rerunState || rerunState.activeVersion === 0 || !rerunState.versions?.length) {
      return data
    }
    const versionIndex = rerunState.activeVersion - 1
    return rerunState.versions[versionIndex]?.data || data
  }

  const displayData = getDisplayData()

  // Check if we have versions available even if original content is empty
  const hasVersions = rerunState?.versions?.length > 0

  if (!displayData) {
    return (
      <div className="text-center py-12 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-visual/20 rounded-full mb-4 border border-visual/30">
            <span className="w-2 h-2 bg-visual rounded-full shadow-visual-glow"></span>
            <span className="text-visual text-sm font-medium">Visual Learning</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Visual Summary</h2>
          <p className="text-gray-400 mt-2">
            {hasVersions
              ? 'No original content was generated. Select a version below or generate new content.'
              : 'This content wasn\'t generated initially.'}
          </p>
        </div>

        {/* Show version toggle if versions exist */}
        {hasVersions && (
          <RerunControl
            color="visual"
            rerunState={rerunState}
            onRerun={onRerun}
            onVersionChange={onVersionChange}
            hideOriginal={!data}
          />
        )}

        <button
          onClick={() => onRerun?.('')}
          disabled={rerunState?.isLoading}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            rerunState?.isLoading
              ? 'bg-visual/30 text-visual/70 cursor-not-allowed'
              : 'bg-gradient-to-r from-visual to-visual-600 text-white hover:shadow-visual-glow hover:scale-105'
          }`}
        >
          {rerunState?.isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            hasVersions ? 'Generate New Version' : 'Generate Visual Summary'
          )}
        </button>
        {rerunState?.error && (
          <p className="text-red-400 text-sm">{rerunState.error}</p>
        )}
      </div>
    )
  }

  // If we have an actual image
  if (displayData.type === 'image' && displayData.data) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-visual/20 rounded-full mb-2 border border-visual/30">
            <span className="w-2 h-2 bg-visual rounded-full shadow-visual-glow"></span>
            <span className="text-visual text-sm font-medium">Visual Learning</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Visual Summary</h2>
        </div>

        {/* Rerun Control */}
        <RerunControl
          color="visual"
          rerunState={rerunState}
          onRerun={onRerun}
          onVersionChange={onVersionChange}
        />

        <div className="flex justify-center">
          <img
            src={`data:${displayData.mimeType};base64,${displayData.data}`}
            alt="Generated infographic"
            className="max-w-full rounded-2xl shadow-visual-glow border border-visual/30"
          />
        </div>
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.href = `data:${displayData.mimeType};base64,${displayData.data}`
            link.download = 'infographic.png'
            link.click()
          }}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-visual to-visual-600 text-white rounded-xl hover:shadow-visual-glow transition-all duration-300 font-semibold hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Infographic
        </button>
      </div>
    )
  }

  // Text-based fallback infographic
  const keyPoints = displayData.keyPoints || displayData.message || 'No key points available'
  const points = keyPoints.split('\n').filter(p => p.trim())

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-visual/20 rounded-full mb-2 border border-visual/30">
          <span className="w-2 h-2 bg-visual rounded-full shadow-visual-glow"></span>
          <span className="text-visual text-sm font-medium">Visual Learning</span>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Key Concepts Overview</h2>
        <p className="text-gray-400 mt-1">Visual summary of the main topics</p>
      </div>

      {/* Rerun Control */}
      <RerunControl
        color="visual"
        rerunState={rerunState}
        onRerun={onRerun}
        onVersionChange={onVersionChange}
      />

      {/* Visual Key Points Display */}
      <div className="grid gap-4 md:grid-cols-2">
        {points.map((point, index) => {
          // Clean up the point text
          const cleanPoint = point.replace(/^[\d\.\-\*]+\s*/, '').trim()
          if (!cleanPoint) return null

          const colors = [
            'bg-visual/10 border-visual text-visual',
            'bg-audio/10 border-audio text-audio',
            'bg-kinesthetic/10 border-kinesthetic text-kinesthetic',
            'bg-readwrite/10 border-readwrite text-readwrite',
          ]
          const glowColors = [
            'hover:shadow-visual-glow',
            'hover:shadow-audio-glow',
            'hover:shadow-kinesthetic-glow',
            'hover:shadow-readwrite-glow',
          ]
          const colorClass = colors[index % colors.length]
          const glowClass = glowColors[index % glowColors.length]

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${colorClass} ${glowClass} transform hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-dark-200 rounded-lg font-bold text-sm text-white">
                  {index + 1}
                </span>
                <p className="font-medium text-gray-200">{cleanPoint}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info message if image generation wasn't available */}
      {displayData.message && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-sm text-gold">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>Note:</strong> {displayData.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfographicTab
