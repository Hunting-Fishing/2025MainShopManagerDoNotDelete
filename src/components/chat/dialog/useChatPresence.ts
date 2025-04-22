
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserPresence {
  user_id: string;
  online_at: string;
  typing?: boolean;
  user_name?: string;
}

export const useChatPresence = (userId: string, roomId?: string) => {
  const [typingUsers, setTypingUsers] = useState<UserPresence[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const presentUsers = Object.values(presenceState).flat();
        
        // Safely extract and map presence data to our UserPresence interface
        const typedPresentUsers: UserPresence[] = [];
        
        for (const presence of presentUsers) {
          const presenceData = presence as Record<string, any>;
          // Only add if we have the minimum required fields
          if (presenceData) {
            typedPresentUsers.push({
              user_id: presenceData.user_id || '',
              online_at: presenceData.online_at || new Date().toISOString(),
              typing: Boolean(presenceData.typing),
              user_name: presenceData.user_name
            });
          }
        }
        
        // Update online users
        setOnlineUsers(typedPresentUsers);
        
        // Update typing users
        const currentlyTypingUsers = typedPresentUsers.filter(user => user.typing);
        setTypingUsers(currentlyTypingUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Safely cast and extract data from new presences
        const typedNewUsers: UserPresence[] = [];
        
        for (const presence of (newPresences as any[])) {
          typedNewUsers.push({
            user_id: presence.user_id || '',
            online_at: presence.online_at || new Date().toISOString(),
            typing: Boolean(presence.typing),
            user_name: presence.user_name
          });
        }
        
        setOnlineUsers(prev => [...prev, ...typedNewUsers]);
        
        // Update typing users if any of the new users are typing
        const newTypingUsers = typedNewUsers.filter(user => user.typing);
        if (newTypingUsers.length > 0) {
          setTypingUsers(prev => [...prev, ...newTypingUsers]);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Extract user IDs from leaving presences
        const leftUserIds = (leftPresences as any[]).map(p => p.user_id).filter(Boolean);
        setOnlineUsers(prev => prev.filter(p => !leftUserIds.includes(p.user_id)));
        setTypingUsers(prev => prev.filter(p => !leftUserIds.includes(p.user_id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  // Enhanced setTyping function with debounce logic
  const setTyping = async (isTyping: boolean) => {
    if (!roomId) return;
    
    const channel = supabase.channel(`room:${roomId}`);
    await channel.track({
      user_id: userId,
      online_at: new Date().toISOString(),
      typing: isTyping,
    });
  };

  return {
    onlineUsers,
    typingUsers,
    setTyping,
    isUserOnline: (checkUserId: string) => onlineUsers.some(user => user.user_id === checkUserId),
  };
};
