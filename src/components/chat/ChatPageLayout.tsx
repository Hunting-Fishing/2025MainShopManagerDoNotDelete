
import React from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatRoom, ChatMessage } from '@/types/chat';

interface ChatPageLayoutProps {
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  userName: string;
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSelectRoom: (room: ChatRoom) => void;
  onSendMessage: (threadParentId?: string) => void;
  onSendVoiceMessage?: (audioUrl: string, threadParentId?: string) => void;
  onSendFileMessage?: (fileUrl: string, threadParentId?: string) => void;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  isTyping?: boolean;
  typingUsers?: {id: string, name: string}[];
  threadMessages?: {[key: string]: ChatMessage[]};
  activeThreadId?: string | null;
  onOpenThread?: (messageId: string) => void;
  onCloseThread?: () => void;
  onViewWorkOrderDetails?: () => void;
  navigateToRoom: (roomId: string) => void;
  onNewChat: () => void;
  newChatDialog?: React.ReactNode;
}

export const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({
  chatRooms,
  currentRoom,
  messages,
  userId,
  userName,
  newMessageText,
  setNewMessageText,
  onSelectRoom,
  onSendMessage,
  onSendVoiceMessage,
  onSendFileMessage,
  onPinRoom,
  onArchiveRoom,
  onFlagMessage,
  onEditMessage,
  isTyping,
  typingUsers,
  threadMessages,
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewWorkOrderDetails,
  navigateToRoom,
  onNewChat,
  newChatDialog
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        <div className="md:col-span-1">
          <ChatSidebar
            rooms={chatRooms}
            selectedRoom={currentRoom}
            onSelectRoom={(room) => {
              onSelectRoom(room);
              navigateToRoom(room.id);
            }}
            onNewChat={onNewChat}
            newChatDialog={newChatDialog}
          />
        </div>
        
        <div className="md:col-span-2">
          <ChatWindow
            room={currentRoom}
            messages={messages}
            userId={userId}
            userName={userName}
            messageText={newMessageText}
            setMessageText={setNewMessageText}
            onSendMessage={onSendMessage}
            onSendVoiceMessage={onSendVoiceMessage}
            onSendFileMessage={onSendFileMessage}
            onPinRoom={onPinRoom}
            onArchiveRoom={onArchiveRoom}
            onFlagMessage={onFlagMessage}
            onEditMessage={onEditMessage}
            isTyping={isTyping}
            typingUsers={typingUsers}
            threadMessages={threadMessages}
            activeThreadId={activeThreadId}
            onOpenThread={onOpenThread}
            onCloseThread={onCloseThread}
            onViewInfo={currentRoom?.work_order_id ? onViewWorkOrderDetails : undefined}
          />
        </div>
      </div>
    </div>
  );
};
