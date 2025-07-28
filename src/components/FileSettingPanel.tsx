// src/components/FileSettingsPanel.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface FileSettingsPanelProps {
  onClose: () => void;
}

const FileSettingsPanel: React.FC<FileSettingsPanelProps> = ({ onClose }) => {
  const { roomId, userIdentifier, logout, clearMessages } = useAppContext();
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>File Settings</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="settings-content">
        <div className="settings-section">
          <h4>File Information</h4>
          <div className="info-item">
            <span className="info-label">Your Identifier:</span>
            <span className="info-value">{userIdentifier}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Session ID:</span>
            <span className="info-value">{roomId?.substring(0, 8)}...</span>
          </div>
        </div>
        
        <div className="settings-section">
          <h4>Security Options</h4>
          <button 
            className="settings-button warning-button"
            onClick={() => {
              if (confirm("Clear all comments? This cannot be undone.")) {
                clearMessages();
                onClose();
              }
            }}
          >
            Clear All Comments
          </button>
          
          {!confirmDelete ? (
            <button 
              className="settings-button danger-button"
              onClick={() => setConfirmDelete(true)}
            >
              Exit File
            </button>
          ) : (
            <div className="confirm-actions">
              <p className="confirm-text">Are you sure you want to exit?</p>
              <div className="confirm-buttons">
                <button 
                  className="settings-button"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button 
                  className="settings-button danger-button"
                  onClick={() => {
                    logout();
                  }}
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="settings-section">
          <h4>Display Options</h4>
          <div className="toggle-option">
            <label htmlFor="dark-mode">Dark Mode</label>
            <input 
              type="checkbox" 
              id="dark-mode" 
              className="toggle-switch"
            />
          </div>
          <div className="toggle-option">
            <label htmlFor="large-text">Larger Text</label>
            <input 
              type="checkbox" 
              id="large-text" 
              className="toggle-switch"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSettingsPanel;