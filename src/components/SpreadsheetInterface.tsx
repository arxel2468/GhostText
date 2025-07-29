// src/components/SpreadsheetInterface.tsx (improved)
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import SpreadsheetToolbar from './SpreadsheetToolbar';
import SpreadsheetGrid from './SpreadsheetGrid';
import CommentPanel from './CommentPanel';

const SpreadsheetInterface: React.FC = () => {
  const { 
    logout, 
    messages, 
    sendMessage, 
    decryptMessageContent, 
    chatLoading,
    activeCell, 
    setActiveCell,
    spreadsheetData,
    updateCell,
    toggleCellNote,
    hasNewMessages,
    markMessagesAsSeen,
    clearMessages
  } = useAppContext();
  
  const [isCommentsActive, setIsCommentsActive] = useState(false);
  const isMobile = window.innerWidth <= 768;
  
  // Mark messages as seen when comments panel is opened
  useEffect(() => {
    if (isCommentsActive) {
      markMessagesAsSeen();
    }
  }, [isCommentsActive, markMessagesAsSeen]);
  
  const toggleCommentsMode = () => {
    setIsCommentsActive(!isCommentsActive);
  };
  
  const handleCellDoubleClick = (row: number, col: string) => {
    setActiveCell({ row, col });
    setIsCommentsActive(true);
    toggleCellNote(row, col);
  };
  
  return (
    <div className={`spreadsheet-interface ${isMobile ? 'mobile' : ''}`}>
      <SpreadsheetToolbar 
        onToggleComments={toggleCommentsMode} 
        isCommentsActive={isCommentsActive}
        onLogout={logout}
        hasNewMessages={hasNewMessages}
      />
      
      <div className="main-content">
        {(!isCommentsActive || !isMobile) && (
          <SpreadsheetGrid 
            data={spreadsheetData} 
            onCellDoubleClick={handleCellDoubleClick}
            activeCell={activeCell}
            onCellUpdate={updateCell}
          />
        )}
        
        {isCommentsActive && (
          <CommentPanel 
            messages={messages}
            onSendMessage={sendMessage}
            decryptMessageContent={decryptMessageContent}
            loading={chatLoading}
            activeCell={activeCell}
          />
        )}
      </div>
    </div>
  );
};

export default SpreadsheetInterface;