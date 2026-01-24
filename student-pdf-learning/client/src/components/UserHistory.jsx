import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

function UserHistory({ onSelectUpload }) {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/history`, {
        credentials: 'include'
      });
      const data = await response.json();
      setHistory(data.uploads || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (history.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="card-glow p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-adaptive">Your History</h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-gray-400">Loading...</div>
          ) : (
            history.map((upload) => (
              <button
                key={upload.jobId}
                onClick={() => onSelectUpload?.(upload.jobId)}
                className="w-full p-3 rounded-lg bg-dark-200 hover:bg-dark-300 transition-colors text-left border border-white/5"
              >
                <p className="text-sm font-medium text-adaptive truncate">{upload.fileName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(upload.createdAt).toLocaleDateString()} - {upload.grade} - {upload.status}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UserHistory;
