import { useState, useEffect } from 'react'
import { API_URL } from '../../config'
import HomeworkCreator from './HomeworkCreator'
import HomeworkList from './HomeworkList'
import StudentProgress from './StudentProgress'

export default function TeacherDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'create' | 'homework' | 'students'
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedHomeworkId, setSelectedHomeworkId] = useState(null)

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/teacher/dashboard`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHomeworkCreated = () => {
    setActiveTab('homework')
  }

  const handleViewStudents = (homeworkId) => {
    setSelectedHomeworkId(homeworkId)
    setActiveTab('students')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-adaptive font-heading">
            Teacher <span className="bg-gradient-to-r from-readwrite to-readwrite-600 bg-clip-text text-transparent">Portal</span>
          </h1>
          <p className="text-adaptive-secondary mt-1">Manage homework and track student progress</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-200 text-gray-300 border border-white/10 hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Student View
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'create', label: 'Create Homework', icon: 'M12 4v16m8-8H4' },
          { id: 'homework', label: 'My Homework', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-readwrite/20 text-readwrite border-b-2 border-readwrite'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'dashboard' && (
          <DashboardView
            data={dashboardData}
            isLoading={isLoading}
            error={error}
            onCreateHomework={() => setActiveTab('create')}
            onViewHomework={() => setActiveTab('homework')}
          />
        )}
        {activeTab === 'create' && (
          <HomeworkCreator onSuccess={handleHomeworkCreated} onCancel={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'homework' && (
          <HomeworkList onViewStudents={handleViewStudents} />
        )}
        {activeTab === 'students' && (
          <StudentProgress homeworkId={selectedHomeworkId} onBack={() => setActiveTab('homework')} />
        )}
      </div>
    </div>
  )
}

function DashboardView({ data, isLoading, error, onCreateHomework, onViewHomework }) {
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Homework"
          value={data?.totalHomework || 0}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="readwrite"
        />
        <StatCard
          title="Published"
          value={data?.publishedHomework || 0}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          color="kinesthetic"
        />
        <StatCard
          title="Active Students"
          value={data?.activeStudents || 0}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="visual"
        />
        <StatCard
          title="Submissions"
          value={data?.studentStats?.submitted || 0}
          icon="M5 13l4 4L19 7"
          color="audio"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onCreateHomework}
          className="glass-card p-6 hover:border-readwrite/50 transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-readwrite/20 flex items-center justify-center group-hover:bg-readwrite/30 transition-all">
              <svg className="w-6 h-6 text-readwrite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-adaptive">Create New Homework</h3>
              <p className="text-adaptive-secondary text-sm">Upload PDF and generate questions</p>
            </div>
          </div>
        </button>

        <button
          onClick={onViewHomework}
          className="glass-card p-6 hover:border-visual/50 transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-visual/20 flex items-center justify-center group-hover:bg-visual/30 transition-all">
              <svg className="w-6 h-6 text-visual" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-adaptive">View All Homework</h3>
              <p className="text-adaptive-secondary text-sm">Manage and share your assignments</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Homework */}
      {data?.recentHomework?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-adaptive mb-4">Recent Homework</h3>
          <div className="space-y-3">
            {data.recentHomework.map(hw => (
              <div key={hw._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium text-adaptive">{hw.title}</p>
                  <p className="text-sm text-adaptive-secondary">
                    {new Date(hw.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hw.status === 'published' ? 'bg-kinesthetic/20 text-kinesthetic' :
                    hw.status === 'ready' ? 'bg-audio/20 text-audio' :
                    hw.status === 'generating' ? 'bg-visual/20 text-visual' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {hw.status}
                  </span>
                  {hw.shareCode && (
                    <span className="font-mono text-sm text-readwrite bg-readwrite/10 px-2 py-1 rounded">
                      {hw.shareCode}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    visual: 'bg-visual/20 text-visual',
    audio: 'bg-audio/20 text-audio',
    readwrite: 'bg-readwrite/20 text-readwrite',
    kinesthetic: 'bg-kinesthetic/20 text-kinesthetic'
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold text-adaptive">{value}</p>
          <p className="text-sm text-adaptive-secondary">{title}</p>
        </div>
      </div>
    </div>
  )
}
