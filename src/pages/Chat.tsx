import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useChat } from '@/hooks/useChat';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useChatRoomActions } from '@/hooks/useChatRoomActions';
import { ChatLoading } from '@/components/chat/ChatLoading';
import { ChatPageLayout } from '@/components/chat/ChatPageLayout';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { toast } from '@/hooks/use-toast';

export default function Chat() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
    handleEditMessage,
    isTyping,
    typingUsers,
    handleTyping,
    threadMessages,
    activeThreadId,
    handleThreadOpen,
    handleThreadClose,
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
    getShiftChat,
    handleViewWorkOrderDetails
  } = useChatRoomActions(userId, selectRoom, refreshRooms);

  useEffect(() => {
    const state = location.state as any;
    if (state?.createShiftChat) {
      setShowNewChatDialog(true);
      
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, setShowNewChatDialog]);

  useChatNotifications({ userId: userId || '' });

  useEffect(() => {
    if (!userId || !roomId) return;

    const findRoomInLoaded = () => {
      if (chatRooms.length > 0) {
        const room = chatRooms.find(r => r.id === roomId);
        if (room) {
          selectRoom(room);
          return true;
        }
      }
      return false;
    };

    if (findRoomInLoaded()) {
      return;
    }

    if (roomId.startsWith('shift-chat-')) {
      toast({
        title: "Loading shift chat",
        description: "Please wait while we find the shift chat room."
      });
      
      getShiftChat(roomId)
        .then(room => {
          if (!room && !findRoomInLoaded()) {
            navigate('/chat', { replace: true });
          }
        })
        .catch(() => {
          navigate('/chat', { replace: true });
        });
    } else {
      navigate('/chat', { replace: true });
    }
  }, [roomId, userId, chatRooms, selectRoom, navigate, getShiftChat]);

  if (isLoading) {
    return <ChatLoading />;
  }

  const wrappedSendMessage = async (threadParentId?: string): Promise<void> => {
    await handleSendMessage(threadParentId);
    return Promise.resolve();
  };
  
  const wrappedSendVoiceMessage = async (audioUrl: string, threadParentId?: string): Promise<void> => {
    await handleSendVoiceMessage(audioUrl, threadParentId);
    return Promise.resolve();
  };
  
  const wrappedSendFileMessage = async (fileUrl: string, threadParentId?: string): Promise<void> => {
    await handleSendFileMessage(fileUrl, threadParentId);
    return Promise.resolve();
  };

  const wrappedFlagMessage = (messageId: string, reason: string): void => {
    const isFlagged = Boolean(reason && reason.trim());
    flagMessage(messageId, isFlagged);
  };

  const safeThreadMessages = Array.isArray(threadMessages) ? threadMessages : [];

  const formattedTypingUsers = typingUsers?.map(user => ({
    id: user.user_id,
    name: user.user_name
  })) || [];

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
        onSendMessage={wrappedSendMessage}
        onSendVoiceMessage={wrappedSendVoiceMessage}
        onSendFileMessage={wrappedSendFileMessage}
        onPinRoom={handlePinRoom}
        onArchiveRoom={handleArchiveRoom}
        onFlagMessage={wrappedFlagMessage}
        onEditMessage={handleEditMessage}
        isTyping={isTyping}
        typingUsers={formattedTypingUsers}
        threadMessages={safeThreadMessages}
        activeThreadId={activeThreadId}
        onOpenThread={handleThreadOpen}
        onCloseThread={handleThreadClose}
        onViewWorkOrderDetails={() => currentRoom?.work_order_id && handleViewWorkOrderDetails(currentRoom.work_order_id)}
        navigateToRoom={(roomId) => navigate(`/chat/${roomId}`)}
        onNewChat={() => setShowNewChatDialog(true)}
      />
      
      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onCreate={(name, type, participants, shiftMetadata) => handleCreateChat(type, participants, name, undefined, shiftMetadata)}
      />
    </>
  );
}
