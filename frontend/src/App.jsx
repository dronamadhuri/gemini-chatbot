import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import './App.css';

export default function App() {
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('gemini_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse local storage sessions", e);
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem('gemini_active_session_id') || null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync sessions list to localStorage
  useEffect(() => {
    localStorage.setItem('gemini_chat_sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Sync active session ID to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('gemini_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('gemini_active_session_id');
    }
  }, [activeSessionId]);

  // Check health check status of the backend API
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch (err) {
        setIsBackendOnline(false);
      }
    };

    checkStatus();
    // Poll backend status every 8 seconds
    const interval = setInterval(checkStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = chatSessions.find((s) => s.id === activeSessionId);

  const handleNewChat = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: []
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setErrorMessage('');
  };

  const handleSendMessage = async (text) => {
    setErrorMessage('');
    let currentSessionId = activeSessionId;
    let currentSessions = [...chatSessions];

    // If there is no active session, create one automatically
    if (!activeSessionId) {
      const newSessionId = Date.now().toString();
      const newSession = {
        id: newSessionId,
        title: text.length > 25 ? text.substring(0, 25) + '...' : text,
        messages: []
      };
      currentSessions = [newSession, ...currentSessions];
      setChatSessions(currentSessions);
      setActiveSessionId(newSessionId);
      currentSessionId = newSessionId;
    }

    const userMessage = { role: 'user', text };

    // Update messages local state
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const updatedMessages = [...s.messages, userMessage];
          const title =
            s.title === 'New Conversation'
              ? text.length > 25
                ? text.substring(0, 25) + '...'
                : text
              : s.title;
          return { ...s, title, messages: updatedMessages };
        }
        return s;
      })
    );

    setIsGenerating(true);

    try {
      // Fetch current session from currentSessions memory scope before state commit
      const sessionObj = currentSessions.find((s) => s.id === currentSessionId);
      const preExistingMessages = sessionObj ? sessionObj.messages : [];

      // Format previous history for the backend
      const history = preExistingMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: history
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Server error occurred.');
      }

      const botMessage = { role: 'model', text: data.reply };
      
      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return { ...s, messages: [...s.messages, botMessage] };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Failed to get response from API:', err);
      setErrorMessage(err.message || 'Unable to connect to the backend server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    if (!activeSessionId) return;
    setChatSessions((prev) => prev.filter((s) => s.id !== activeSessionId));
    setActiveSessionId(null);
    setErrorMessage('');
  };

  return (
    <div className="app-container">
      <Sidebar
        onNewChat={handleNewChat}
        isBackendOnline={isBackendOnline}
        activeSessionId={activeSessionId}
        chatSessions={chatSessions}
        onSelectSession={setActiveSessionId}
      />
      <main className="chat-container">
        <header className="chat-header">
          <div className="model-selector">
            <span className="model-badge">Gemini 2.5 Flash</span>
          </div>
          {activeSession && (
            <button className="clear-chat-btn" onClick={handleClearChat} title="Delete conversation thread">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete Chat
            </button>
          )}
        </header>

        <ChatWindow
          messages={activeSession ? activeSession.messages : []}
          isGenerating={isGenerating}
        />

        {errorMessage && (
          <div className="error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  );
}
