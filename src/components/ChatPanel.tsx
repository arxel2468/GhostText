// src/components/ChatPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { disguiseMessage, isSecretTrigger, setupLongPressDetection } from '../utils/stealth';

interface ChatPanelProps {
  messages: any[];
  onSendMessage: (content: string) => Promise<boolean>;
  decryptMessageContent: (encryptedContent: string) => Promise<string>;
  loading: boolean;
  activeCell: { row: number, col: string } | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
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
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Setup long press for mobile
  useEffect(() => {
    if (!headerRef.current || !messagesContainerRef.current) return;
    
    // Setup long press on header
    const cleanupHeader = setupLongPressDetection(
      headerRef.current,
      () => setShowRealMessages(!showRealMessages)
    );
    
    // Setup long press on messages container
    const cleanupMessages = setupLongPressDetection(
      messagesContainerRef.current,
      () => setShowRealMessages(!showRealMessages)
    );
    
    return () => {
      cleanupHeader();
      cleanupMessages();
    };
  }, [showRealMessages]);

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
  
  // Handle Escape key to hide real messages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showRealMessages) {
        setShowRealMessages(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showRealMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleRealMessages = (e: React.MouseEvent) => {
    if (isSecretTrigger(e)) {
      setShowRealMessages(!showRealMessages);
    }
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
  
  const getCellLabel = () => {
    if (!activeCell) return 'Cell';
    return `Cell ${activeCell.col}${activeCell.row}`;
  };

  return (
    <div className="comment-panel">
      <div 
        className="comment-header" 
        onClick={toggleRealMessages}
        ref={headerRef}
      >
        <h3>Cell {activeCell?.col}{activeCell?.row} Comments</h3>
        {showRealMessages && (
          <div className="secure-mode-indicator">Secure Mode</div>
        )}
        <div className="comment-tools">
          <button className="tool-button">Filter</button>
          <button className="tool-button">Sort</button>
        </div>
      </div>
      
      <div className="comment-list" ref={messagesContainerRef}>
        {loading ? (
          <div className="loading-comments">Loading comments...</div>
        ) : decryptedMessages.length === 0 ? (
          <div className="no-comments">
            <p>No comments for this cell.</p>
            <p className="comment-help">Comments help track changes and decisions.</p>
          </div>
        ) : (
          decryptedMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`comment-item ${showRealMessages ? 'real-comment' : 'fake-comment'}`}
            >
              <div className="comment-metadata">
                <span className="comment-author">User</span>
                <span className="comment-timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="comment-content">
                {showRealMessages 
                  ? msg.decryptedContent 
                  : disguiseMessage(msg.decryptedContent)}
              </div>
              <div className="comment-actions">
                <button className="comment-action">Reply</button>
                <button className="comment-action">Resolve</button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="comment-form-container">
        <form className="comment-form" onSubmit={handleSendMessage}>
          <div className="comment-input-label">Add comment:</div>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={showRealMessages ? "Type secure message..." : "Add a comment..."}
            disabled={sending}
            className={`comment-input ${showRealMessages ? 'secure-input' : ''}`}
            rows={2}
          />
          <div className="comment-form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setNewMessage('')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              className="submit-button"
            >
              {sending ? 'Submitting...' : 'Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;