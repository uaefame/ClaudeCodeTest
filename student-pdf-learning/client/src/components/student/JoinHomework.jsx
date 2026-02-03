import { useState, useEffect } from 'react'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'
import HomeworkView from './HomeworkView'

export default function JoinHomework({ onBack }) {
  const { isAuthenticated, login } = useAuth()
  const [shareCode, setShareCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [myHomework, setMyHomework] = useState([])
  const [selectedHomework, setSelectedHomework] = useState(null)
  const [loadingHomework, setLoadingHomework] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyHomework()
    } else {
      setLoadingHomework(false)
    }
  }, [isAuthenticated])

  const fetchMyHomework = async () => {
    try {
      const response = await fetch(`${API_URL}/api/homework/my`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMyHomework(data.homework || [])
      }
    } catch (err) {
      console.error('Error fetching homework:', err)
    } finally {
      setLoadingHomework(false)
    }
  }

  const handleJoin = async () => {
    if (!shareCode.trim()) {
      setError('Please enter a share code')
      return
    }

    if (!isAuthenticated) {
      setError('Please log in to join homework')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/homework/join/${shareCode.trim().toUpperCase()}`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join homework')
      }

      // Refresh homework list and select the joined one
      await fetchMyHomework()
      setSelectedHomework(data.studentHomeworkId)
      setShareCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatShareCode = (value) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    // Insert dash after 4 characters
    if (cleaned.length > 4) {
      return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8)
    }
    return cleaned
  }

  // If homework is selected, show the homework view
  if (selectedHomework) {
    return (
      <HomeworkView
        studentHomeworkId={selectedHomework}
        onBack={() => {
          setSelectedHomework(null)
          fetchMyHomework()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-adaptive font-heading">
            My <span className="bg-gradient-to-r from-kinesthetic to-kinesthetic-600 bg-clip-text text-transparent">Homework</span>
          </h1>
          <p className="text-adaptive-secondary mt-1">Join homework with a share code or continue working</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-200 text-gray-300 border border-white/10 hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Join with Code */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-adaptive mb-4">Join Homework</h2>

        {!isAuthenticated ? (
          <div className="text-center py-6">
            <p className="text-adaptive-secondary mb-4">Please log in to join homework</p>
            <button
              onClick={login}
              className="px-6 py-2 rounded-xl bg-visual text-white hover:bg-visual-600 transition-all"
            >
              Log in with Google
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(formatShareCode(e.target.value))}
              placeholder="Enter code (e.g., ABCD-1234)"
              maxLength={9}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-adaptive placeholder-gray-500 focus:border-kinesthetic/50 focus:outline-none font-mono text-lg tracking-wider text-center"
            />
            <button
              onClick={handleJoin}
              disabled={isLoading || !shareCode.trim()}
              className="px-6 py-3 rounded-xl bg-kinesthetic text-white hover:bg-kinesthetic-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Joining...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Join
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* My Homework List */}
      {isAuthenticated && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-adaptive mb-4">My Assignments</h2>

          {loadingHomework ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kinesthetic"></div>
            </div>
          ) : myHomework.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-adaptive-secondary">No homework yet. Enter a share code above to join.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myHomework.map(hw => (
                <button
                  key={hw._id}
                  onClick={() => setSelectedHomework(hw._id)}
                  className="w-full p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-adaptive">{hw.homeworkId?.title || 'Untitled'}</h3>
                      <p className="text-sm text-adaptive-secondary">
                        Version {hw.assignedVersion} • {hw.homeworkId?.grade} • {hw.homeworkId?.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-kinesthetic"
                              style={{ width: `${hw.progress?.percentComplete || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-adaptive-secondary">{hw.progress?.percentComplete || 0}%</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hw.status === 'submitted' ? 'bg-kinesthetic/20 text-kinesthetic' :
                        hw.status === 'in_progress' ? 'bg-audio/20 text-audio' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {hw.status?.replace('_', ' ')}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
