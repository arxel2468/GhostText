// src/components/SpreadsheetInterface.tsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import SpreadsheetToolbar from './SpreadsheetToolbar';
import SpreadsheetGrid from './SpreadsheetGrid';
import CommentPanel from './CommentPanel';
import { isMobileDevice } from '../utils/stealth';

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
    roomId
  } = useAppContext();
  
  const [isCommentsActive, setIsCommentsActive] = useState(false);
  const isMobile = isMobileDevice();
  
  // Mark messages as seen when comments panel is opened
  useEffect(() => {
    if (isCommentsActive) {
      markMessagesAsSeen();
    }
  }, [isCommentsActive, markMessagesAsSeen]);
  
  // On mobile, automatically show comments when there are new messages
  useEffect(() => {
    if (isMobile && hasNewMessages && !isCommentsActive) {
      setIsCommentsActive(true);
    }
  }, [hasNewMessages, isCommentsActive, isMobile]);
  
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
        roomId={roomId}
      />
      
      <div className="main-content">
        <SpreadsheetGrid 
          data={spreadsheetData} 
          onCellDoubleClick={handleCellDoubleClick}
          activeCell={activeCell}
          onCellUpdate={updateCell}
          isMobile={isMobile}
        />
        
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
      
      <div className="spreadsheet-footer">
        <div className="status-bar">
          {activeCell 
            ? `${activeCell.col}${activeCell.row}` 
            : 'Ready'}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetInterface;