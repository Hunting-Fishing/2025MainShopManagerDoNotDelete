
import React from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatRoom } from '@/types/chat';

interface ChatPageLayoutProps {
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: any[];
  userId: string;
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSelectRoom: (room: ChatRoom) => void;
  onSendMessage: () => void;
  onViewWorkOrderDetails?: () => void;
  navigateToRoom: (roomId: string) => void;
  onNewChat: () => void;
}

export const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({
  chatRooms,
  currentRoom,
  messages,
  userId,
  newMessageText,
  setNewMessageText,
  onSelectRoom,
  onSendMessage,
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
            messageText={newMessageText}
            setMessageText={setNewMessageText}
            onSendMessage={onSendMessage}
            onViewInfo={currentRoom?.work_order_id ? onViewWorkOrderDetails : undefined}
          />
        </div>
      </div>
    </div>
  );
};
