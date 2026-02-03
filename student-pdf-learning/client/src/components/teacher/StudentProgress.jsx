import { useState, useEffect } from 'react'
import { API_URL } from '../../config'

export default function StudentProgress({ homeworkId, onBack }) {
  const [students, setStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState(homeworkId ? 'homework' : 'all') // 'homework' | 'all'
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    if (viewMode === 'homework' && homeworkId) {
      fetchHomeworkStudents()
    } else {
      fetchAllStudents()
    }
  }, [viewMode, homeworkId])

  const fetchHomeworkStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/teacher/homework/${homeworkId}/students`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data.students)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllStudents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/teacher/students`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setAllStudents(data.students)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudentDetail = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/students/${studentId}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch student details')
      const data = await response.json()
      setSelectedStudent(data)
    } catch (err) {
      console.error('Error fetching student details:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'text-kinesthetic bg-kinesthetic/20'
      case 'in_progress': return 'text-audio bg-audio/20'
      case 'not_started': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const VarkChart = ({ usage }) => {
    const total = (usage?.visual || 0) + (usage?.auditory || 0) + (usage?.readwrite || 0) + (usage?.kinesthetic || 0)
    if (total === 0) return <span className="text-adaptive-secondary text-sm">No data</span>

    const percentages = {
      visual: Math.round(((usage?.visual || 0) / total) * 100),
      auditory: Math.round(((usage?.auditory || 0) / total) * 100),
      readwrite: Math.round(((usage?.readwrite || 0) / total) * 100),
      kinesthetic: Math.round(((usage?.kinesthetic || 0) / total) * 100)
    }

    return (
      <div className="flex gap-1 h-4 rounded-full overflow-hidden w-32">
        {percentages.visual > 0 && (
          <div className="bg-visual h-full" style={{ width: `${percentages.visual}%` }} title={`Visual: ${percentages.visual}%`} />
        )}
        {percentages.auditory > 0 && (
          <div className="bg-audio h-full" style={{ width: `${percentages.auditory}%` }} title={`Auditory: ${percentages.auditory}%`} />
        )}
        {percentages.readwrite > 0 && (
          <div className="bg-readwrite h-full" style={{ width: `${percentages.readwrite}%` }} title={`Read/Write: ${percentages.readwrite}%`} />
        )}
        {percentages.kinesthetic > 0 && (
          <div className="bg-kinesthetic h-full" style={{ width: `${percentages.kinesthetic}%` }} title={`Kinesthetic: ${percentages.kinesthetic}%`} />
        )}
      </div>
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
      </div>
    )
  }

  // Student Detail View
  if (selectedStudent) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-adaptive-secondary hover:text-adaptive transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </button>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-visual/20 flex items-center justify-center text-2xl font-bold text-visual">
              {selectedStudent.student?.displayName?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-adaptive">{selectedStudent.student?.displayName}</h2>
              <p className="text-adaptive-secondary">{selectedStudent.student?.email}</p>
            </div>
          </div>

          {/* VARK Profile */}
          <div className="mb-6">
            <h3 className="font-medium text-adaptive mb-3">VARK Usage</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { key: 'visual', label: 'Visual', color: 'visual' },
                { key: 'auditory', label: 'Auditory', color: 'audio' },
                { key: 'readwrite', label: 'Read/Write', color: 'readwrite' },
                { key: 'kinesthetic', label: 'Kinesthetic', color: 'kinesthetic' }
              ].map(v => {
                const seconds = selectedStudent.varkUsageTotals?.[v.key] || 0
                const minutes = Math.round(seconds / 60)
                return (
                  <div key={v.key} className="text-center p-3 bg-white/5 rounded-lg">
                    <div className={`text-2xl font-bold text-${v.color}`}>{minutes}m</div>
                    <div className="text-sm text-adaptive-secondary">{v.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Homework History */}
          <div>
            <h3 className="font-medium text-adaptive mb-3">Homework History</h3>
            {selectedStudent.homeworkHistory?.length > 0 ? (
              <div className="space-y-2">
                {selectedStudent.homeworkHistory.map(hw => (
                  <div key={hw._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-adaptive">{hw.homeworkId?.title || 'Untitled'}</p>
                      <p className="text-sm text-adaptive-secondary">Version {hw.assignedVersion}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-adaptive">{hw.score?.percentage || 0}%</p>
                        <p className="text-sm text-adaptive-secondary">{hw.score?.earned || 0}/{hw.score?.total || 0} pts</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hw.status)}`}>
                        {hw.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-adaptive-secondary text-center py-4">No homework history</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {homeworkId && (
            <button
              onClick={() => setViewMode('homework')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'homework' ? 'bg-readwrite/20 text-readwrite' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              This Homework
            </button>
          )}
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'all' ? 'bg-readwrite/20 text-readwrite' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Students
          </button>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-adaptive-secondary hover:text-adaptive transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* VARK Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-adaptive-secondary">VARK:</span>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-visual"></span> Visual</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-audio"></span> Auditory</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-readwrite"></span> Read/Write</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-kinesthetic"></span> Kinesthetic</div>
      </div>

      {/* Students List */}
      {viewMode === 'homework' && homeworkId ? (
        students.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-adaptive-secondary">No students have joined this homework yet.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-adaptive">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-adaptive">Version</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-adaptive">Progress</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-adaptive">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-adaptive">VARK Usage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-adaptive">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map(s => (
                  <tr key={s._id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => fetchStudentDetail(s.studentId?._id)}
                        className="text-left hover:text-visual transition-all"
                      >
                        <p className="font-medium text-adaptive">{s.studentId?.displayName}</p>
                        <p className="text-sm text-adaptive-secondary">{s.studentId?.email}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded bg-white/10 text-sm font-mono">{s.assignedVersion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-kinesthetic"
                            style={{ width: `${s.progress?.percentComplete || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-adaptive-secondary">{s.progress?.percentComplete || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-adaptive">{s.score?.percentage || 0}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <VarkChart usage={s.varkUsage} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                        {s.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        allStudents.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-adaptive-secondary">No students have taken any of your homework yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {allStudents.map(({ student, stats }) => (
              <div key={student?._id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => fetchStudentDetail(student?._id)}
                    className="flex items-center gap-3 text-left hover:opacity-80 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-visual/20 flex items-center justify-center text-lg font-bold text-visual">
                      {student?.displayName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-adaptive">{student?.displayName}</p>
                      <p className="text-sm text-adaptive-secondary">{student?.email}</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-adaptive">{stats?.completedAssignments || 0}/{stats?.totalAssignments || 0}</p>
                      <p className="text-xs text-adaptive-secondary">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-adaptive">{stats?.averageScore || 0}%</p>
                      <p className="text-xs text-adaptive-secondary">Avg Score</p>
                    </div>
                    <div>
                      <VarkChart usage={stats?.varkUsage} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
