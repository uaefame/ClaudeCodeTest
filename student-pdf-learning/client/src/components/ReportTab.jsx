import ReactMarkdown from 'react-markdown'

function ReportTab({ content }) {
  if (!content) {
    return (
      <div className="text-center py-12 text-navy-400">
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
      await navigator.clipboard.writeText(content)
      alert('Report copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-readwrite-50 rounded-full mb-2">
            <span className="w-2 h-2 bg-readwrite rounded-full"></span>
            <span className="text-readwrite-700 text-sm font-medium">Read/Write Learning</span>
          </div>
          <h2 className="text-xl font-bold text-navy-800 font-heading">Study Report</h2>
          <p className="text-navy-500 mt-1">Comprehensive explanation of the concepts</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-readwrite text-white rounded-lg hover:bg-readwrite-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div
        id="report-content"
        className="bg-white border border-navy-100 rounded-xl p-8 prose max-w-none"
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-navy-900 border-b-2 border-readwrite pb-2 font-heading">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 text-navy-800 font-heading">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-navy-700 font-heading">{children}</h3>,
            p: ({ children }) => <p className="mb-4 leading-relaxed text-navy-600">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-navy-600">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-navy-600">{children}</ol>,
            li: ({ children }) => <li className="ml-2">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-navy-800">{children}</strong>,
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-')
              if (isBlock) {
                return <code className="block bg-navy-50 p-4 rounded-lg overflow-x-auto text-sm">{children}</code>
              }
              return <code className="bg-navy-50 px-1.5 py-0.5 rounded text-sm text-readwrite">{children}</code>
            },
            pre: ({ children }) => <pre className="bg-navy-50 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-readwrite pl-4 italic text-navy-600 my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Table of Contents (if content is long) */}
      {content.length > 2000 && (
        <div className="bg-readwrite-50 rounded-lg p-4">
          <h3 className="font-semibold text-readwrite-700 mb-2">Quick Navigation</h3>
          <p className="text-sm text-readwrite-600">
            Use Ctrl+F (or Cmd+F on Mac) to search for specific topics in this report.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportTab
