
import React from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatRoom } from '@/types/chat';

interface ChatPageLayoutProps {
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: any[];
  userId: string;
  userName: string;
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSelectRoom: (room: ChatRoom) => void;
  onSendMessage: () => void;
  onSendVoiceMessage?: (audioUrl: string) => void;
  onSendFileMessage?: (fileUrl: string) => void;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  isTyping?: boolean;
  onViewWorkOrderDetails?: () => void;
  navigateToRoom: (roomId: string) => void;
  onNewChat: () => void;
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
  isTyping,
  onViewWorkOrderDetails,
  navigateToRoom,
  onNewChat
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
            isTyping={isTyping}
            onViewInfo={currentRoom?.work_order_id ? onViewWorkOrderDetails : undefined}
          />
        </div>
      </div>
    </div>
  );
};
