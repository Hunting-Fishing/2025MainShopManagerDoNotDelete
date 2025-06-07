
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatPageLayout } from '@/components/chat/ChatPageLayout';
import { useChat } from '@/hooks/useChat';
import { useChatRoomActions } from '@/hooks/useChatRoomActions';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize chat functionality
  const {
    chatRooms,
    currentRoom,
    messages,
    loading,
    error,
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
    fetchThreadReplies,
    refreshRooms
  } = useChat({
    userId: user?.id || '',
    userName: user?.email || 'User'
  });

  // Chat room actions
  const {
    showNewChatDialog,
    setShowNewChatDialog,
    handleCreateChat,
    openWorkOrderChat,
    getShiftChat,
    handleViewWorkOrderDetails
  } = useChatRoomActions(
    user?.id,
    selectRoom,
    refreshRooms
  );

  // Enable chat notifications
  useChatNotifications({ userId: user?.id || '' });

  // Handle room selection from URL
  useEffect(() => {
    if (roomId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomId);
      if (room) {
        selectRoom(room);
      } else {
        // If room ID is not found, redirect to main chat
        navigate('/chat');
      }
    }
  }, [roomId, chatRooms, selectRoom, navigate]);

  const navigateToRoom = (newRoomId: string) => {
    navigate(`/chat/${newRoomId}`);
  };

  const handleNewChat = () => {
    setShowNewChatDialog(true);
  };

  const handleViewWorkOrderDetailsAction = () => {
    if (currentRoom?.work_order_id) {
      handleViewWorkOrderDetails(currentRoom.work_order_id);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Team communication and messaging
          </p>
        </div>
        
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access chat functionality.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading chat from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">
            Team communication and messaging
          </p>
        </div>
        
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading chat: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All chat data is live from your Supabase database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>

      <ChatPageLayout
        chatRooms={chatRooms}
        currentRoom={currentRoom}
        messages={messages}
        userId={user.id}
        userName={user.email || 'User'}
        newMessageText={newMessageText}
        setNewMessageText={setNewMessageText}
        onSelectRoom={selectRoom}
        onSendMessage={handleSendMessage}
        onSendVoiceMessage={handleSendVoiceMessage}
        onSendFileMessage={handleSendFileMessage}
        onPinRoom={handlePinRoom}
        onArchiveRoom={handleArchiveRoom}
        onFlagMessage={flagMessage}
        onEditMessage={handleEditMessage}
        isTyping={isTyping}
        typingUsers={typingUsers}
        threadMessages={threadMessages}
        activeThreadId={activeThreadId}
        onOpenThread={handleThreadOpen}
        onCloseThread={handleThreadClose}
        onViewWorkOrderDetails={handleViewWorkOrderDetailsAction}
        navigateToRoom={navigateToRoom}
        onNewChat={handleNewChat}
      />
    </div>
  );
}
