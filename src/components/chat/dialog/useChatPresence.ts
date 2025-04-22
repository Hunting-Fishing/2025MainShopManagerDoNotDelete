
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserPresence {
  user_id: string;
  online_at: string;
  typing?: boolean;
}

export const useChatPresence = (userId: string, roomId?: string) => {
  const [typingUsers, setTypingUsers] = useState<UserPresence[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const presentUsers = Object.values(presenceState).flat() as UserPresence[];
        setOnlineUsers(presentUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers(prev => [...prev, ...newPresences as UserPresence[]]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = (leftPresences as UserPresence[]).map(p => p.user_id);
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
