
import { useState, useEffect, useCallback } from 'react';
import { ChatRoom } from '@/types/chat';
import { getUserChatRooms } from '@/services/chat';
import { supabase } from '@/integrations/supabase/client';

interface UseChatRoomsProps {
  userId: string;
}

export const useChatRooms = ({ userId }: UseChatRoomsProps) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat rooms
  const fetchChatRooms = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const fetchedRooms = await getUserChatRooms(userId);
      setChatRooms(fetchedRooms);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Subscribe to chat room updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('public:chat_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms'
      }, () => {
        // Refresh the rooms when changes occur
        fetchChatRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchChatRooms]);

  // Initial fetch of chat rooms
  useEffect(() => {
    if (userId) {
      fetchChatRooms();
    }
  }, [userId, fetchChatRooms]);

  return {
    chatRooms,
    loading,
    error,
    refreshRooms: fetchChatRooms
  };
};
