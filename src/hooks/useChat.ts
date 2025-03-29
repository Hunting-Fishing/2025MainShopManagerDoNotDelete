
import { useState, useEffect, useCallback } from 'react';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { 
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages
} from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

interface UseChatProps {
  userId: string;
  userName: string;
}

export const useChat = ({ userId, userName }: UseChatProps) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');

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
  }, [userId]);

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

  useEffect(() => {
    if (userId) {
      fetchChatRooms();
    }
  }, [userId, fetchChatRooms]);

  // Select a chat room
  const selectRoom = useCallback(async (room: ChatRoom) => {
    try {
      setCurrentRoom(room);
      setLoading(true);
      
      // Fetch messages for the selected room
      const fetchedMessages = await getChatMessages(room.id);
      setMessages(fetchedMessages);
      
      // Mark messages as read
      await markMessagesAsRead(room.id, userId);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Subscribe to new messages when a room is selected
  useEffect(() => {
    if (!currentRoom || !userId) return;

    const unsubscribe = subscribeToMessages(currentRoom.id, (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // If the message is from someone else, mark it as read
      if (newMessage.sender_id !== userId) {
        markMessagesAsRead(currentRoom.id, userId).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoom, userId]);

  // Send a new message
  const handleSendMessage = useCallback(async () => {
    if (!currentRoom || !newMessageText.trim() || !userId) return;
    
    try {
      const sentMessage = await sendMessage({
        room_id: currentRoom.id,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText
      });
      
      // Update local messages (the subscription will also catch this)
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  }, [currentRoom, newMessageText, userId, userName]);

  return {
    chatRooms,
    currentRoom,
    messages,
    loading,
    error,
    newMessageText,
    setNewMessageText,
    selectRoom,
    handleSendMessage,
    refreshRooms: fetchChatRooms
  };
};
