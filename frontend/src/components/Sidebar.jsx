import React from 'react';

export default function Sidebar({ 
  onNewChat, 
  isBackendOnline, 
  activeSessionId, 
  chatSessions, 
  onSelectSession 
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="app-logo">
          <svg className="app-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 12h10v10L22 12H12V2z" />
          </svg>
          <span>Gemini Chat</span>
        </div>
        
        <button className="new-chat-btn" onClick={onNewChat} title="Start a new chat session">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="sidebar-content">
        <div className="chat-history-title">Recent Chats</div>
        <ul className="history-list">
          {chatSessions.map((session) => (
            <li 
              key={session.id} 
              className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => onSelectSession(session.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div className="history-text" title={session.title}>
                {session.title}
              </div>
            </li>
          ))}
          {chatSessions.length === 0 && (
            <li className="history-item" style={{ cursor: 'default', background: 'transparent', opacity: 0.4 }}>
              No recent chats
            </li>
          )}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className={`dot ${isBackendOnline ? '' : 'offline'}`}></span>
          <span>{isBackendOnline ? 'Service Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </aside>
  );
}
