// src/components/UserPresenceIndicator.tsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { db, ref, onValue } from '../firebase';

const UserPresenceIndicator: React.FC = () => {
  const { roomId } = useAppContext();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!roomId) return;
    
    const presenceRef = ref(db, `presence/${roomId}`);
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setOnlineUsers([]);
        return;
      }
      
      const users = Object.keys(data);
      setOnlineUsers(users);
    });
    
    return () => {
      unsubscribe();
    };
  }, [roomId]);
  
  if (onlineUsers.length === 0) return null;
  
  return (
    <div className="presence-indicator">
      <div className="presence-count">
        {onlineUsers.length} online
      </div>
      <div className="presence-users">
        {onlineUsers.map(user => (
          <div key={user} className="user-badge" title={user}>
            {user.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPresenceIndicator;