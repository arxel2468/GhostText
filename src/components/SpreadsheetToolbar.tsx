// src/components/SpreadsheetToolbar.tsx
import React from 'react';
import { isMobileDevice } from '../utils/stealth';

interface SpreadsheetToolbarProps {
  onToggleComments: () => void;
  isCommentsActive: boolean;
  onLogout: () => void;
  hasNewMessages: boolean;
  roomId: string | null;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  onToggleComments,
  isCommentsActive,
  onLogout,
  hasNewMessages,
  roomId
}) => {
  const isMobile = isMobileDevice();
  
  return (
    <div className="spreadsheet-toolbar">
      <div className="toolbar-left">
        <div className="toolbar-title">
          Budget Tracker - Q3 2025
          {roomId && <span className="file-id">ID: {roomId.substring(0, 6)}...</span>}
        </div>
      </div>
      
      {!isMobile && (
        <div className="toolbar-center">
          <button className="toolbar-button">File</button>
          <button className="toolbar-button">Edit</button>
          <button className="toolbar-button">View</button>
          <button className="toolbar-button">Insert</button>
          <button className="toolbar-button">Format</button>
          <button className="toolbar-button">Data</button>
          <button className="toolbar-button">Tools</button>
          <button className="toolbar-button">Help</button>
        </div>
      )}
      
      <div className="toolbar-right">
        <button 
          className={`toolbar-button comments-button ${hasNewMessages ? 'has-updates' : ''}`}
          onClick={onToggleComments}
          title={isCommentsActive ? "Hide Comments" : "Show Comments"}
        >
          {isCommentsActive ? "Hide Comments" : "Comments"}
          {hasNewMessages && <span className="notification-dot"></span>}
        </button>
        
        <button 
          className="toolbar-button save-button"
          onClick={() => {
            if (confirm("Save and close this spreadsheet?")) {
              onLogout();
            }
          }}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default SpreadsheetToolbar;