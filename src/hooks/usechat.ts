// src/hooks/useChat.ts
import { useState, useEffect } from 'react';
import { db, ref, onValue, push, set } from '../firebase';
import { encryptMessage, decryptMessage } from '../utils/encryption';

export function useChat(sharedKey: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sharedKey) {
      setError('No encryption key provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    const messagesRef = ref(db, 'messages');
    
    try {
      const unsubscribe = onValue(messagesRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setMessages([]);
          setLoading(false);
          return;
        }
        
        // Process messages
        const messageList = Object.entries(data).map(([id, msgData]: [string, any]) => ({
          id,
          ...msgData,
        }));
        
        // Sort by timestamp
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messageList);
        setLoading(false);
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  }, [sharedKey]);

  const sendMessage = async (content: string) => {
    if (!sharedKey) {
      setError('No encryption key provided');
      return false;
    }
    
    try {
      const encryptedContent = await encryptMessage(content, sharedKey);
      const timestamp = Date.now();
      
      const messagesRef = ref(db, 'messages');
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        content: encryptedContent,
        timestamp,
        sender: 'user', // In a real app, you'd use actual user IDs
      });
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  };

  const decryptMessageContent = async (encryptedContent: string) => {
    try {
      return await decryptMessage(encryptedContent, sharedKey);
    } catch (err) {
      console.error('Error decrypting message:', err);
      return '[Encryption error]';
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    decryptMessageContent,
  };
}