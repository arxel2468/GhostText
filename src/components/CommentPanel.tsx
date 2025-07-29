// src/components/CommentPanel.tsx (simplified)
import React, { useState, useEffect, useRef } from 'react';
import { disguiseMessage } from '../utils/stealth';

interface CommentPanelProps {
  messages: any[];
  onSendMessage: (content: string) => Promise<boolean>;
  decryptMessageContent: (encryptedContent: string) => Promise<string>;
  loading: boolean;
  activeCell: { row: number, col: string } | null;
}

const CommentPanel: React.FC<CommentPanelProps> = ({
  messages,
  onSendMessage,
  decryptMessageContent,
  loading,
  activeCell
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState<any[]>([]);
  const [showRealMessages, setShowRealMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Decrypt messages when they change
  useEffect(() => {
    const decryptAllMessages = async () => {
      const decrypted = await Promise.all(
        messages.map(async (msg) => {
          try {
            const decryptedContent = await decryptMessageContent(msg.content);
            return {
              ...msg,
              decryptedContent
            };
          } catch (error) {
            console.error('Error decrypting message:', error);
            return {
              ...msg,
              decryptedContent: '[Encryption error]'
            };
          }
        })
      );
      
      setDecryptedMessages(decrypted);
    };
    
    decryptAllMessages();
  }, [messages, decryptMessageContent]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [decryptedMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const success = await onSendMessage(newMessage);
    
    if (success) {
      setNewMessage('');
    } else {
      alert('Failed to send message. Please try again.');
    }
    
    setSending(false);
  };
  
  return (
    <div className="comment-panel">
      <div className="comment-header">
        <h3>Comments</h3>
        <button 
          className={`secure-toggle-button ${showRealMessages ? 'active' : ''}`}
          onClick={() => setShowRealMessages(!showRealMessages)}
        >
          {showRealMessages ? "Less Info" : "More Info"}
        </button>
      </div>
      
      <div className="comment-list">
        {loading ? (
          <div className="loading-comments">Loading comments...</div>
        ) : decryptedMessages.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet.</p>
          </div>
        ) : (
          decryptedMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`comment-item ${showRealMessages ? 'real-comment' : 'fake-comment'}`}
            >
              <div className="comment-metadata">
                <span className="comment-author">{msg.sender || 'User'}</span>
                <span className="comment-timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="comment-content">
                {showRealMessages 
                  ? msg.decryptedContent 
                  : disguiseMessage(msg.decryptedContent)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="comment-form-container">
        <form className="comment-form" onSubmit={handleSendMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={showRealMessages ? "Type secure message..." : "Add a comment..."}
            disabled={sending}
            className="comment-input"
            rows={2}
          />
          <div className="comment-form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setNewMessage('')}
            >
              Clear
            </button>
            <button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              className="submit-button"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentPanel;