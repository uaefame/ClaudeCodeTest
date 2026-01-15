function InfographicTab({ data }) {
  if (!data) {
    return (
      <div className="text-center py-12 text-navy-400">
        No infographic data available
      </div>
    )
  }

  // If we have an actual image
  if (data.type === 'image' && data.data) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-visual-50 rounded-full mb-2">
            <span className="w-2 h-2 bg-visual rounded-full"></span>
            <span className="text-visual-700 text-sm font-medium">Visual Learning</span>
          </div>
          <h2 className="text-xl font-bold text-navy-800 font-heading">Visual Summary</h2>
        </div>
        <div className="flex justify-center">
          <img
            src={`data:${data.mimeType};base64,${data.data}`}
            alt="Generated infographic"
            className="max-w-full rounded-lg shadow-lg border border-visual-200"
          />
        </div>
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.href = `data:${data.mimeType};base64,${data.data}`
            link.download = 'infographic.png'
            link.click()
          }}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-visual text-white rounded-lg hover:bg-visual-600 transition-colors"
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
  const keyPoints = data.keyPoints || data.message || 'No key points available'
  const points = keyPoints.split('\n').filter(p => p.trim())

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-visual-50 rounded-full mb-2">
          <span className="w-2 h-2 bg-visual rounded-full"></span>
          <span className="text-visual-700 text-sm font-medium">Visual Learning</span>
        </div>
        <h2 className="text-xl font-bold text-navy-800 font-heading">Key Concepts Overview</h2>
        <p className="text-navy-500 mt-1">Visual summary of the main topics</p>
      </div>

      {/* Visual Key Points Display */}
      <div className="grid gap-4 md:grid-cols-2">
        {points.map((point, index) => {
          // Clean up the point text
          const cleanPoint = point.replace(/^[\d\.\-\*]+\s*/, '').trim()
          if (!cleanPoint) return null

          const colors = [
            'bg-visual-50 border-visual-400 text-visual-700',
            'bg-audio-50 border-audio-400 text-audio-700',
            'bg-kinesthetic-50 border-kinesthetic-400 text-kinesthetic-700',
            'bg-readwrite-50 border-readwrite-400 text-readwrite-700',
          ]
          const colorClass = colors[index % colors.length]

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${colorClass} transform hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full font-bold text-sm shadow-sm">
                  {index + 1}
                </span>
                <p className="font-medium">{cleanPoint}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info message if image generation wasn't available */}
      {data.message && (
        <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 text-sm text-gold-500">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>Note:</strong> {data.message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfographicTab
