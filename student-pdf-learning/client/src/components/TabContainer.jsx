import { useState } from 'react'
import InfographicTab from './InfographicTab'
import AudioTab from './AudioTab'
import InteractiveTab from './InteractiveTab'
import ReportTab from './ReportTab'

const tabs = [
  { id: 'infographic', label: 'Visual', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'visual' },
  { id: 'audio', label: 'Audio', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z', color: 'audio' },
  { id: 'interactive', label: 'Kinesthetic', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'kinesthetic' },
  { id: 'report', label: 'Read/Write', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'readwrite' }
]

function TabContainer({ results }) {
  const [activeTab, setActiveTab] = useState('infographic')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'infographic':
        return <InfographicTab data={results.infographic} />
      case 'audio':
        return <AudioTab audioData={results.audioScript} />
      case 'interactive':
        return <InteractiveTab data={results.interactiveLearning} />
      case 'report':
        return <ReportTab content={results.report} />
      default:
        return null
    }
  }

  const getTabColors = (color, isActive) => {
    const colors = {
      visual: isActive
        ? 'text-visual border-b-2 border-visual bg-visual-50'
        : 'text-navy-400 hover:text-visual hover:bg-visual-50/50',
      audio: isActive
        ? 'text-audio border-b-2 border-audio bg-audio-50'
        : 'text-navy-400 hover:text-audio hover:bg-audio-50/50',
      kinesthetic: isActive
        ? 'text-kinesthetic border-b-2 border-kinesthetic bg-kinesthetic-50'
        : 'text-navy-400 hover:text-kinesthetic hover:bg-kinesthetic-50/50',
      readwrite: isActive
        ? 'text-readwrite border-b-2 border-readwrite bg-readwrite-50'
        : 'text-navy-400 hover:text-readwrite hover:bg-readwrite-50/50',
    }
    return colors[color]
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-navy-100">
      {/* Tab Navigation */}
      <div className="border-b border-navy-200 bg-navy-50">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 ${getTabColors(tab.color, activeTab === tab.id)}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={tab.icon}
                />
              </svg>
              <span className="hidden sm:inline font-body">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default TabContainer
