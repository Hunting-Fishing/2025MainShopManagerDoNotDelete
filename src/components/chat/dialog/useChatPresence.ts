
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
        // Cast presence data to match our UserPresence interface
        const typedPresentUsers = presentUsers.map(p => ({
          user_id: p.user_id || '',
          online_at: p.online_at || new Date().toISOString(),
          typing: p.typing || false,
          user_name: p.user_name
        })) as UserPresence[];
        
        setOnlineUsers(typedPresentUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Cast incoming presences to match our UserPresence interface
        const typedNewUsers = (newPresences as any[]).map(p => ({
          user_id: p.user_id || '',
          online_at: p.online_at || new Date().toISOString(),
          typing: p.typing || false,
          user_name: p.user_name
        })) as UserPresence[];
        
        setOnlineUsers(prev => [...prev, ...typedNewUsers]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Cast leaving presences to match our UserPresence interface
        const leftUserIds = (leftPresences as any[]).map(p => p.user_id);
        setOnlineUsers(prev => prev.filter(p => !leftUserIds.includes(p.user_id)));
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
  };
};
