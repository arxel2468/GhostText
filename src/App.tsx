// src/App.tsx
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import SpreadsheetInterface from './components/SpreadsheetInterface';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAppContext();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Budget Tracker Pro...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginScreen />
      ) : (
        <SpreadsheetInterface />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;