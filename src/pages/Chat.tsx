
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useChat } from '@/hooks/useChat';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useChatRoomActions } from '@/hooks/useChatRoomActions';
import { ChatLoading } from '@/components/chat/ChatLoading';
import { ChatPageLayout } from '@/components/chat/ChatPageLayout';
import { useChatNotifications } from '@/hooks/useChatNotifications';

export default function Chat() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const { userId, userName, isLoading } = useAuthUser();
  
  const {
    chatRooms,
    currentRoom,
    messages,
    loading: chatLoading,
    error,
    newMessageText,
    setNewMessageText,
    handleSendMessage,
    handleSendVoiceMessage,
    handleSendFileMessage,
    handlePinRoom,
    handleArchiveRoom,
    flagMessage,
    isTyping,
    selectRoom,
    refreshRooms
  } = useChat({
    userId: userId || '',
    userName: userName
  });

  const {
    showNewChatDialog,
    setShowNewChatDialog,
    handleCreateChat,
    openWorkOrderChat,
    handleViewWorkOrderDetails
  } = useChatRoomActions(userId, selectRoom, refreshRooms);

  // Use chat notifications hook
  useChatNotifications({ userId: userId || '' });

  // Load specified room if roomId is provided in URL
  useEffect(() => {
    if (roomId && userId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomId);
      if (room) {
        selectRoom(room);
      } else {
        navigate('/chat');
      }
    }
  }, [roomId, chatRooms, selectRoom, navigate, userId]);

  if (isLoading) {
    return <ChatLoading />;
  }

  return (
    <>
      <ChatPageLayout
        chatRooms={chatRooms}
        currentRoom={currentRoom}
        messages={messages}
        userId={userId || ''}
        userName={userName}
        newMessageText={newMessageText}
        setNewMessageText={setNewMessageText}
        onSelectRoom={selectRoom}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onSendFileMessage={handleSendFileMessage}
        onPinRoom={handlePinRoom}
        onArchiveRoom={handleArchiveRoom}
        onFlagMessage={flagMessage}
        isTyping={isTyping}
        onViewWorkOrderDetails={() => currentRoom?.work_order_id && handleViewWorkOrderDetails(currentRoom.work_order_id)}
        navigateToRoom={(roomId) => navigate(`/chat/${roomId}`)}
        onNewChat={() => setShowNewChatDialog(true)}
      />
      
      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onCreate={(name, type, participants) => handleCreateChat(type, participants, name)}
      />
    </>
  );
}
