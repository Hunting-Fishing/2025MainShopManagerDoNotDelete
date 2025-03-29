
import { useState, useCallback } from 'react';
import { ChatRoom } from '@/types/chat';
import { useChatRooms } from './useChatRooms';
import { useChatMessages } from './useChatMessages';
import { markMessagesAsRead } from '@/services/chat';

interface UseChatProps {
  userId: string;
  userName: string;
}

export const useChat = ({ userId, userName }: UseChatProps) => {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  
  // Use the extracted hooks
  const { 
    chatRooms, 
    loading: roomsLoading, 
    error: roomsError,
    refreshRooms
  } = useChatRooms({ userId });

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    newMessageText,
    setNewMessageText,
    handleSendMessage
  } = useChatMessages({ 
    userId, 
    userName, 
    currentRoomId: currentRoom?.id || null 
  });

  // Select a chat room
  const selectRoom = useCallback(async (room: ChatRoom) => {
    setCurrentRoom(room);
    // Mark messages as read is handled in useChatMessages now
  }, []);

  return {
    chatRooms,
    currentRoom,
    messages,
    loading: roomsLoading || messagesLoading,
    error: roomsError || messagesError,
    newMessageText,
    setNewMessageText,
    selectRoom,
    handleSendMessage,
    refreshRooms
  };
};
