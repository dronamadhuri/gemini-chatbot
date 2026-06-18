import React, { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, isGenerating }) {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages list changes or generation state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Utility to parse basic markdown tags safely in vanilla React
  const renderMessageContent = (text) => {
    if (!text) return '';

    // 1. Escape HTML to prevent XSS
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Parse code blocks: ```code```
    escaped = escaped.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // 3. Parse inline code: `code`
    escaped = escaped.replace(/`([^`\n]+?)`/g, '<code>$1</code>');

    // 4. Parse bold: **text**
    escaped = escaped.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

    // 5. Parse bullet lists: - item
    // Matches lines starting with '-' and wraps them in <li>
    escaped = escaped.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
    
    // Group consecutive <li> items into <ul>
    escaped = escaped.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => {
      return `<ul>${match}</ul>`;
    });

    // 6. Parse paragraphs
    // Split by block tags to avoid inserting paragraph markers inside pre/ul tags
    const blocks = escaped.split(/(<pre>[\s\S]*?<\/pre>|<ul>[\s\S]*?<\/ul>)/g);
    const htmlOutput = blocks
      .map((block) => {
        if (block.startsWith('<pre>') || block.startsWith('<ul>')) {
          return block;
        }
        return block
          .split(/\n\n+/)
          .map((p) => {
            const trimmed = p.trim();
            if (!trimmed) return '';
            // Convert single newlines to <br /> inside paragraphs
            return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
          })
          .join('');
      })
      .join('');

    return <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />;
  };

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <div className="welcome-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="welcome-title">Welcome to Gemini Chat</h2>
          <p className="welcome-subtitle">
            An elegant chat interface powered by Google's state-of-the-art model. Start typing below to begin a conversation.
          </p>
          
          <div className="suggested-prompts">
            <div className="suggested-prompt-card">
              <div className="title">Explain a concept</div>
              <div className="desc">"Explain quantum computing in simple terms for a beginner."</div>
            </div>
            <div className="suggested-prompt-card">
              <div className="title">Write some code</div>
              <div className="desc">"Write a Python function to sort a list of dictionaries."</div>
            </div>
          </div>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}`}>
            <div className="message-bubble">
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))
      )}

      {isGenerating && (
        <div className="message-row model">
          <div className="bot-generating">
            <span className="generating-text">Gemini is thinking</span>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
