import { useState, useEffect } from 'react'
import { API_URL } from '../../config'

export default function HomeworkList({ onViewStudents }) {
  const [homework, setHomework] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    fetchHomework()
  }, [])

  const fetchHomework = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/teacher/homework`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch homework')
      const data = await response.json()
      setHomework(data.homework)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this homework? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/teacher/homework/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to delete homework')
      setHomework(prev => prev.filter(h => h._id !== id))
    } catch (err) {
      alert('Error deleting homework: ' + err.message)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-500/20 text-gray-400',
      generating: 'bg-visual/20 text-visual',
      ready: 'bg-audio/20 text-audio',
      published: 'bg-kinesthetic/20 text-kinesthetic',
      closed: 'bg-red-500/20 text-red-400'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-readwrite"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/30 text-center">
        <p className="text-red-400">Error: {error}</p>
        <button onClick={fetchHomework} className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
          Retry
        </button>
      </div>
    )
  }

  if (homework.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-adaptive mb-2">No Homework Yet</h3>
        <p className="text-adaptive-secondary">Create your first homework to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {homework.map(hw => (
        <div key={hw._id} className="glass-card p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-adaptive">{hw.title}</h3>
                {getStatusBadge(hw.status)}
              </div>
              {hw.description && (
                <p className="text-sm text-adaptive-secondary mb-2">{hw.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-adaptive-secondary">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {hw.grade}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {hw.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {hw.studentCount || 0} students
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {hw.submittedCount || 0} submitted
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(hw.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hw.shareCode && (
                <button
                  onClick={() => handleCopyCode(hw.shareCode)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-readwrite/10 text-readwrite hover:bg-readwrite/20 transition-all"
                >
                  <span className="font-mono">{hw.shareCode}</span>
                  {copiedCode === hw.shareCode ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              )}

              <button
                onClick={() => onViewStudents(hw._id)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-visual/10 hover:text-visual transition-all"
                title="View Students"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>

              <button
                onClick={() => handleDelete(hw._id)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
