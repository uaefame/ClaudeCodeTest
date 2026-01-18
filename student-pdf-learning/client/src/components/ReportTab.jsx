import ReactMarkdown from 'react-markdown'
import RerunControl from './RerunControl'

function ReportTab({ content, rerunState, onRerun, onVersionChange }) {
  // Determine which content to display based on active version
  const getDisplayContent = () => {
    if (!rerunState || rerunState.activeVersion === 0 || !rerunState.versions?.length) {
      return content
    }
    const versionIndex = rerunState.activeVersion - 1
    return rerunState.versions[versionIndex]?.data || content
  }

  const displayContent = getDisplayContent()

  if (!displayContent) {
    return (
      <div className="text-center py-12 text-gray-400">
        No report available
      </div>
    )
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Study Report</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
            h1 { font-size: 24px; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
            h2 { font-size: 20px; margin-top: 24px; color: #374151; }
            h3 { font-size: 16px; margin-top: 16px; color: #4b5563; }
            p { margin: 12px 0; }
            ul, ol { margin: 12px 0; padding-left: 24px; }
            li { margin: 4px 0; }
            strong { font-weight: 600; }
            code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
            pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${document.getElementById('report-content').innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent)
      alert('Report copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-readwrite/20 rounded-full mb-2 border border-readwrite/30">
            <span className="w-2 h-2 bg-readwrite rounded-full shadow-readwrite-glow"></span>
            <span className="text-readwrite text-sm font-medium">Read/Write Learning</span>
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Study Report</h2>
          <p className="text-gray-400 mt-1">Comprehensive explanation of the concepts</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 text-sm border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-readwrite to-readwrite-600 text-white rounded-xl hover:shadow-readwrite-glow transition-all duration-300 font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Rerun Control */}
      <RerunControl
        color="readwrite"
        rerunState={rerunState}
        onRerun={onRerun}
        onVersionChange={onVersionChange}
      />

      {/* Report Content */}
      <div
        id="report-content"
        className="bg-dark-100 border border-white/10 rounded-2xl p-8 prose max-w-none"
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white border-b-2 border-readwrite pb-2 font-heading">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 text-gray-100 font-heading">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-200 font-heading">{children}</h3>,
            p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-300">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-')
              if (isBlock) {
                return <code className="block bg-dark-200 p-4 rounded-xl overflow-x-auto text-sm border border-white/5">{children}</code>
              }
              return <code className="bg-dark-200 px-1.5 py-0.5 rounded text-sm text-readwrite">{children}</code>
            },
            pre: ({ children }) => <pre className="bg-dark-200 p-4 rounded-xl overflow-x-auto mb-4 border border-white/5">{children}</pre>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-readwrite pl-4 italic text-gray-400 my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {displayContent}
        </ReactMarkdown>
      </div>

      {/* Table of Contents (if content is long) */}
      {displayContent.length > 2000 && (
        <div className="bg-readwrite/10 rounded-xl p-4 border border-readwrite/20">
          <h3 className="font-semibold text-readwrite mb-2">Quick Navigation</h3>
          <p className="text-sm text-gray-400">
            Use Ctrl+F (or Cmd+F on Mac) to search for specific topics in this report.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportTab
