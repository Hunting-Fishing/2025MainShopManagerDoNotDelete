
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatRoom } from '@/types/chat';

// Mock data for demonstration purposes
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'Work Order #1234',
    type: 'work_order',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message: {
      id: '101',
      content: 'When will the car be ready?',
      sender_id: 'user2',
      created_at: new Date().toISOString()
    },
    unread_count: 2
  },
  {
    id: '2',
    name: 'John Smith',
    type: 'direct',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message: {
      id: '102',
      content: 'I\'ll check on that part for you',
      sender_id: 'user1',
      created_at: new Date().toISOString()
    },
    unread_count: 0
  }
];

export default function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  
  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
  };
  
  const handleNewChat = () => {
    // Implementation for creating a new chat would go here
    console.log("Create new chat");
  };
  
  return (
    <div className="h-[calc(100vh-120px)] gap-4 flex">
      <div className="w-1/3 h-full">
        <ChatSidebar 
          rooms={mockChatRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onNewChat={handleNewChat}
        />
      </div>
      <div className="w-2/3 h-full">
        <Card className="h-full">
          {!selectedRoom ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              Select a conversation or start a new chat
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{selectedRoom.name}</h2>
              <div className="border-t pt-4">
                Chat messages will appear here.
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
