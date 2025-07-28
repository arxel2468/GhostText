// src/context/AppContext.tsx
import React, { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import { db, ref, onValue, push, set, remove, onDisconnect } from '../firebase';
import { encryptMessage, decryptMessage } from '../utils/encryption';

interface AppContextType {
  isAuthenticated: boolean;
  sharedKey: string;
  roomId: string | null;
  userIdentifier: string;
  loading: boolean;
  login: (key: string, roomId: string, identifier: string, isCreating: boolean) => void;
  logout: () => void;
  messages: any[];
  sendMessage: (content: string) => Promise<boolean>;
  decryptMessageContent: (encryptedContent: string) => Promise<string>;
  chatLoading: boolean;
  activeCell: { row: number, col: string } | null;
  setActiveCell: (cell: { row: number, col: string } | null) => void;
  spreadsheetData: any;
  updateCell: (row: number, col: string, value: string) => void;
  toggleCellNote: (row: number, col: string) => void;
  hasNewMessages: boolean;
  markMessagesAsSeen: () => void;
  clearMessages: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sharedKey, setSharedKey] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState('');

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState(0);
  
  // Spreadsheet state
  const [activeCell, setActiveCell] = useState<{ row: number, col: string } | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any>({});

  
  // Initialize auth from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('ghosttext_session');
    const savedRoomId = localStorage.getItem('ghosttext_room');
    const savedIdentifier = localStorage.getItem('ghosttext_user');
    
    if (savedKey && savedRoomId && savedIdentifier) {
      setSharedKey(savedKey);
      setRoomId(savedRoomId);
      setUserIdentifier(savedIdentifier);
      setIsAuthenticated(true);
    }
    
    // Also retrieve last seen timestamp
    const savedTimestamp = localStorage.getItem('ghosttext_last_seen');
    if (savedTimestamp) {
      setLastSeenTimestamp(parseInt(savedTimestamp, 10));
    }
    
    setLoading(false);
  }, []);
  
  // Initialize spreadsheet data
  useEffect(() => {
    setSpreadsheetData(generateDefaultSpreadsheetData());
  }, []);
  
  // Listen for messages when authenticated and room is set
  useEffect(() => {
    if (!isAuthenticated || !sharedKey || !roomId) {
      setMessages([]);
      setChatLoading(false);
      return;
    }
    
    setChatLoading(true);
    // Use roomId to create a separate "channel" for each room
    const messagesRef = ref(db, `messages/${roomId}`);
    
    try {
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setMessages([]);
          setChatLoading(false);
          return;
        }
        
        // Process messages
        const messageList = Object.entries(data).map(([id, msgData]: [string, any]) => ({
          id,
          ...msgData,
        }));
        
        // Sort by timestamp
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        
        // Check for new messages
        const newestMessage = messageList[messageList.length - 1];
        if (newestMessage && newestMessage.timestamp > lastSeenTimestamp) {
          setHasNewMessages(true);
        }
        
        setMessages(messageList);
        setChatLoading(false);
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error fetching messages:', err);
      setChatLoading(false);
    }
  }, [isAuthenticated, sharedKey, roomId, lastSeenTimestamp]);
  
  // Auth functions
  const login = (key: string, newRoomId: string, identifier: string, isCreating: boolean) => {
    setSharedKey(key);
    setRoomId(newRoomId);
    setUserIdentifier(identifier);
    localStorage.setItem('ghosttext_session', key);
    localStorage.setItem('ghosttext_room', newRoomId);
    localStorage.setItem('ghosttext_user', identifier);
    setIsAuthenticated(true);
    
    // If creating a new file, initialize it in the database
    if (isCreating) {
      const roomRef = ref(db, `rooms/${newRoomId}`);
      set(roomRef, {
        created: Date.now(),
        creator: identifier,
        name: newRoomId.substring(0, 8) // Store a shortened version of the room ID as the name
      }).catch(error => {
        console.error('Error creating room:', error);
      });
    }
  };
  
  // Track user presence
  useEffect(() => {
    if (!isAuthenticated || !roomId || !userIdentifier) return;
    
    // Create a presence reference for this user
    const presenceRef = ref(db, `presence/${roomId}/${userIdentifier}`);
    
    // Set user as online
    set(presenceRef, {
      online: true,
      lastSeen: Date.now()
    });
    
    // Remove presence when disconnected
    onDisconnect(presenceRef).remove();
    
    return () => {
      // Clean up presence when component unmounts
      remove(presenceRef).catch(error => {
        console.error('Error removing presence:', error);
      });
    };
  }, [isAuthenticated, roomId, userIdentifier]);

  const logout = () => {
    // Clean up presence before logging out
    if (roomId && userIdentifier) {
      const presenceRef = ref(db, `presence/${roomId}/${userIdentifier}`);
      remove(presenceRef).catch(error => {
        console.error('Error removing presence on logout:', error);
      });
    }
    
    setSharedKey('');
    setRoomId(null);
    setUserIdentifier('');
    setIsAuthenticated(false);
    localStorage.removeItem('ghosttext_session');
    localStorage.removeItem('ghosttext_room');
    localStorage.removeItem('ghosttext_user');
  };
  
  // Chat functions
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!sharedKey || !roomId) return false;
    
    try {
      const encryptedContent = await encryptMessage(content, sharedKey);
      const timestamp = Date.now();
      
      const messagesRef = ref(db, `messages/${roomId}`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        content: encryptedContent,
        timestamp,
        sender: userIdentifier, // Use the user's identifier
      });
      
      // Mark your own messages as seen
      setLastSeenTimestamp(timestamp);
      localStorage.setItem('ghosttext_last_seen', timestamp.toString());
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };
  
  const decryptMessageContent = async (encryptedContent: string): Promise<string> => {
    try {
      return await decryptMessage(encryptedContent, sharedKey);
    } catch (err) {
      console.error('Error decrypting message:', err);
      return '[Encryption error]';
    }
  };
  
  // Mark messages as seen
  const markMessagesAsSeen = () => {
    if (messages.length > 0) {
      const newestTimestamp = messages[messages.length - 1].timestamp;
      setLastSeenTimestamp(newestTimestamp);
      localStorage.setItem('ghosttext_last_seen', newestTimestamp.toString());
      setHasNewMessages(false);
    }
  };
  
  // Spreadsheet functions
  const updateCell = (row: number, col: string, value: string) => {
    setSpreadsheetData(prevData => ({
      ...prevData,
      [row]: {
        ...prevData[row],
        [col]: {
          ...prevData[row]?.[col],
          value
        }
      }
    }));
  };

  const clearMessages = async (): Promise<void> => {
    if (!roomId) return;
    
    try {
      const messagesRef = ref(db, `messages/${roomId}`);
      await set(messagesRef, null);
      return;
    } catch (err) {
      console.error('Error clearing messages:', err);
      throw err;
    }
  };
  
  const toggleCellNote = (row: number, col: string) => {
    setSpreadsheetData(prevData => ({
      ...prevData,
      [row]: {
        ...prevData[row],
        [col]: {
          ...prevData[row]?.[col],
          hasNote: !prevData[row]?.[col]?.hasNote
        }
      }
    }));
  };
  
  const value = {
    isAuthenticated,
    sharedKey,
    roomId,
    userIdentifier,
    loading,
    login,
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
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Helper function to generate default spreadsheet data
function generateDefaultSpreadsheetData() {
  const data: any = {};
  
  // Header row
  data[0] = {
    'A': { value: 'Date' },
    'B': { value: 'Category' },
    'C': { value: 'Amount' },
    'D': { value: 'Notes' },
    'E': { value: 'Running Total' },
    'F': { value: 'Budget' },
    'G': { value: 'Variance' }
  };
  
  // Sample data rows
  data[1] = {
    'A': { value: '07/15/2025' },
    'B': { value: 'Groceries' },
    'C': { value: '127.84' },
    'D': { value: 'Weekly shopping' },
    'E': { value: '127.84', formula: '=C1' },
    'F': { value: '150.00' },
    'G': { value: '22.16', formula: '=F1-C1' }
  };
  
  data[2] = {
    'A': { value: '07/18/2025' },
    'B': { value: 'Utilities' },
    'C': { value: '94.32' },
    'D': { value: 'Electricity bill' },
    'E': { value: '222.16', formula: '=E1+C2' },
    'F': { value: '100.00' },
    'G': { value: '5.68', formula: '=F2-C2' }
  };
  
  data[3] = {
    'A': { value: '07/20/2025' },
    'B': { value: 'Entertainment' },
    'C': { value: '45.99' },
    'D': { value: 'Movie tickets' },
    'E': { value: '268.15', formula: '=E2+C3' },
    'F': { value: '50.00' },
    'G': { value: '4.01', formula: '=F3-C3' }
  };
  
  return data;
}