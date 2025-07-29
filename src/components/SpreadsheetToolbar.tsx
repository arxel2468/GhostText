// src/components/SpreadsheetToolbar.tsx (simplified)
import React from 'react';

interface SpreadsheetToolbarProps {
  onToggleComments: () => void;
  isCommentsActive: boolean;
  onLogout: () => void;
  hasNewMessages: boolean;
}

const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  onToggleComments,
  isCommentsActive,
  onLogout,
  hasNewMessages
}) => {
  return (
    <div className="spreadsheet-toolbar">
      <div className="toolbar-left">
        <div className="toolbar-title">Budget Tracker</div>
      </div>
      
      <div className="toolbar-right">
        <button 
          className={`toolbar-button comments-button ${hasNewMessages ? 'has-updates' : ''}`}
          onClick={onToggleComments}
        >
          {isCommentsActive ? "Hide Comments" : "Comments"}
          {hasNewMessages && <span className="notification-dot"></span>}
        </button>
        
        <button 
          className="toolbar-button settings-button"
          onClick={() => {
            // Show a simple settings menu
            const action = window.confirm("Choose an action:\n- OK: Clear all messages\n- Cancel: Log out");
            if (action) {
              if (window.confirm("Are you sure you want to clear all messages?")) {
                // Clear messages
                window.location.reload();
              }
            } else {
              onLogout();
            }
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default SpreadsheetToolbar;