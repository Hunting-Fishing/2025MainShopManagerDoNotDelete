
import { useState, useEffect, useCallback } from 'react';
import { ChatRoom } from '@/types/chat';
import { getUserChatRooms } from '@/services/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
      // Sort by most recently updated
      fetchedRooms.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setChatRooms(fetchedRooms);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      setError('Failed to load chat rooms');
      toast({
        title: "Error",
        description: "Couldn't load conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Subscribe to chat room updates
  useEffect(() => {
    if (!userId) return;

    // Subscribe to changes in chat_rooms
    const roomsChannel = supabase
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

    // Subscribe to changes in chat_messages (to update last_message and unread_count)
    const messagesChannel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, () => {
        // Refresh the rooms when a new message is added
        fetchChatRooms();
      })
      .subscribe();

    // Initial fetch of chat rooms
    fetchChatRooms();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [userId, fetchChatRooms]);

  return {
    chatRooms,
    loading,
    error,
    refreshRooms: fetchChatRooms
  };
};
