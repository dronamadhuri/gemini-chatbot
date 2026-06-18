import React, { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSendMessage, isGenerating }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow height of the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to compute scrollHeight accurately
    textarea.style.height = '24px';
    const scrollHeight = textarea.scrollHeight;
    
    // Set to scroll height with a max boundary
    textarea.style.height = `${Math.min(scrollHeight - 4, 180)}px`;
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isGenerating) return;

    onSendMessage(text.trim());
    setText('');
    
    // Keep focus on the input field
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e) => {
    // Send on Enter, allow multi-line with Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-area">
      <div className="input-container">
        <textarea
          ref={textareaRef}
          className="message-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything..."
          rows={1}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim() || isGenerating}
          title="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </form>
  );
}
