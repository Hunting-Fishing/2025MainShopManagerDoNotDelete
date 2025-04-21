
import { useState, useCallback } from 'react';
import { ChatRoom } from '@/types/chat';
import { useChatRooms } from './useChatRooms';
import { useChatMessages } from './useChatMessages';

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
    refreshRooms,
    pinRoom,
    archiveRoom
  } = useChatRooms({ userId });

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    newMessageText,
    setNewMessageText,
    handleSendMessage,
    handleSendVoiceMessage,
    handleSendFileMessage,
    flagMessage,
    handleEditMessage,
    isTyping,
    typingUsers,
    handleTyping,
    threadMessages,
    activeThreadId,
    handleThreadOpen,
    handleThreadClose,
    getThreadReplies
  } = useChatMessages({ 
    userId, 
    userName, 
    currentRoomId: currentRoom?.id || null 
  });

  // Select a chat room
  const selectRoom = useCallback(async (room: ChatRoom) => {
    setCurrentRoom(room);
  }, []);

  // Pin a room
  const handlePinRoom = useCallback(() => {
    if (currentRoom) {
      pinRoom(currentRoom.id, !currentRoom.is_pinned);
    }
  }, [currentRoom, pinRoom]);

  // Archive a room
  const handleArchiveRoom = useCallback(() => {
    if (currentRoom) {
      archiveRoom(currentRoom.id, !currentRoom.is_archived);
    }
  }, [currentRoom, archiveRoom]);

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
    handleSendVoiceMessage,
    handleSendFileMessage,
    handlePinRoom,
    handleArchiveRoom,
    flagMessage,
    handleEditMessage,
    isTyping,
    typingUsers,
    handleTyping,
    threadMessages,
    activeThreadId,
    handleThreadOpen,
    handleThreadClose,
    getThreadReplies,
    refreshRooms
  };
};
