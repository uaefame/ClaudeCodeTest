function InfographicTab({ data }) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        No infographic data available
      </div>
    )
  }

  // If we have an actual image
  if (data.type === 'image' && data.data) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Visual Summary</h2>
        <div className="flex justify-center">
          <img
            src={`data:${data.mimeType};base64,${data.data}`}
            alt="Generated infographic"
            className="max-w-full rounded-lg shadow-lg"
          />
        </div>
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.href = `data:${data.mimeType};base64,${data.data}`
            link.download = 'infographic.png'
            link.click()
          }}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
        <h2 className="text-xl font-bold text-gray-800">Key Concepts Overview</h2>
        <p className="text-gray-600 mt-1">Visual summary of the main topics</p>
      </div>

      {/* Visual Key Points Display */}
      <div className="grid gap-4 md:grid-cols-2">
        {points.map((point, index) => {
          // Clean up the point text
          const cleanPoint = point.replace(/^[\d\.\-\*]+\s*/, '').trim()
          if (!cleanPoint) return null

          const colors = [
            'bg-blue-100 border-blue-400 text-blue-800',
            'bg-green-100 border-green-400 text-green-800',
            'bg-purple-100 border-purple-400 text-purple-800',
            'bg-orange-100 border-orange-400 text-orange-800',
            'bg-pink-100 border-pink-400 text-pink-800',
            'bg-teal-100 border-teal-400 text-teal-800',
            'bg-indigo-100 border-indigo-400 text-indigo-800',
          ]
          const colorClass = colors[index % colors.length]

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${colorClass} transform hover:scale-102 transition-transform`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full font-bold text-sm">
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
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
