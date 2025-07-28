// src/components/LoginScreen.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateRoomId } from '../utils/roomSecurity';

const LoginScreen: React.FC = () => {
  const { login } = useAppContext();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [fileName, setFileName] = useState('');
  const [accessPhrase, setAccessPhrase] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Generate the room ID from the file name and access phrase
      const roomId = await generateRoomId(fileName, accessPhrase);
      
      // Create the encryption key
      const encryptionKey = roomId;
      
      // Simulate loading
      setTimeout(() => {
        login(encryptionKey, roomId, userIdentifier, isCreatingFile);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error with file:', error);
      setLoading(false);
      alert(`Failed to ${isCreatingFile ? 'create' : 'open'} file. Please try again.`);
    }
  };
  
  return (
    <div className="login-screen">
      <div className="login-container">
        <h1>Budget Tracker Pro</h1>
        <p>Enterprise Edition</p>
        
        <div className="login-tabs">
          <button 
            className={`tab-button ${!isCreatingFile ? 'active' : ''}`}
            onClick={() => setIsCreatingFile(false)}
            type="button"
          >
            Open Existing File
          </button>
          <button 
            className={`tab-button ${isCreatingFile ? 'active' : ''}`}
            onClick={() => setIsCreatingFile(true)}
            type="button"
          >
            Create New File
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file-name">File Name:</label>
            <input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={isCreatingFile ? "Enter new file name" : "Enter existing file name"}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="access-phrase">Access Phrase:</label>
            <input
              id="access-phrase"
              type="password"
              value={accessPhrase}
              onChange={(e) => setAccessPhrase(e.target.value)}
              placeholder={isCreatingFile ? "Create access phrase" : "Enter access phrase"}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="user-identifier">Your Identifier:</label>
            <input
              id="user-identifier"
              type="text"
              value={userIdentifier}
              onChange={(e) => setUserIdentifier(e.target.value)}
              placeholder="Your name or identifier"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !fileName || !accessPhrase || !userIdentifier}
            className="login-button"
          >
            {loading 
              ? (isCreatingFile ? 'Creating file...' : 'Opening file...') 
              : (isCreatingFile ? 'Create & Open File' : 'Open File')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;