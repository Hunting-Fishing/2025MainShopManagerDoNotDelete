
import { useState, useEffect, useCallback } from 'react';
import { ChatRoom } from '@/types/chat';
import { getUserChatRooms, pinChatRoom, archiveChatRoom } from '@/services/chat';
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
      
      // Sort by pin status first, then by most recently updated
      fetchedRooms.sort((a, b) => {
        // Pinned rooms come first
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        
        // Then sort by update time
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      
      // Filter out archived rooms unless we're specifically viewing them
      const filteredRooms = fetchedRooms.filter(room => !room.is_archived);
      
      setChatRooms(filteredRooms);
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

  // Pin a chat room
  const pinRoom = useCallback(async (roomId: string, isPinned: boolean) => {
    try {
      await pinChatRoom(roomId, isPinned);
      
      // Update local state
      setChatRooms(prevRooms => {
        const updatedRooms = prevRooms.map(room => 
          room.id === roomId ? { ...room, is_pinned: isPinned } : room
        );
        
        // Re-sort based on pin status
        return [...updatedRooms].sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      });
      
      toast({
        title: isPinned ? "Conversation pinned" : "Conversation unpinned",
        description: isPinned 
          ? "This conversation will stay at the top of your list" 
          : "This conversation has been unpinned",
      });
    } catch (err) {
      console.error('Failed to pin/unpin room:', err);
      toast({
        title: "Error",
        description: "Failed to update conversation settings.",
        variant: "destructive",
      });
    }
  }, []);

  // Archive a chat room
  const archiveRoom = useCallback(async (roomId: string, isArchived: boolean) => {
    try {
      await archiveChatRoom(roomId, isArchived);
      
      // Update local state - remove from list if archived
      if (isArchived) {
        setChatRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
      } else {
        // If unarchiving, we'll need to fetch all rooms again
        fetchChatRooms();
      }
      
      toast({
        title: isArchived ? "Conversation archived" : "Conversation unarchived",
        description: isArchived 
          ? "This conversation has been moved to archives" 
          : "This conversation has been restored",
      });
    } catch (err) {
      console.error('Failed to archive/unarchive room:', err);
      toast({
        title: "Error",
        description: "Failed to update conversation settings.",
        variant: "destructive",
      });
    }
  }, [fetchChatRooms]);

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
    refreshRooms: fetchChatRooms,
    pinRoom,
    archiveRoom
  };
};
