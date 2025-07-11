
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

// Mock data for now - replace with real service calls
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General Discussion',
    type: 'group',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: true,
    is_archived: false,
    metadata: {},
    retention_period: null,
    retention_type: null,
    work_order_id: null
  },
  {
    id: '2', 
    name: 'Work Order #1234',
    type: 'work_order',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: false,
    is_archived: false,
    metadata: {},
    retention_period: null,
    retention_type: null,
    work_order_id: '1234'
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    room_id: '1',
    sender_id: 'user1',
    sender_name: 'John Doe',
    content: 'Hello team! How is everyone doing today?',
    created_at: new Date().toISOString(),
    message_type: 'text',
    is_read: true,
    is_edited: false,
    is_flagged: false,
    thread_count: 0,
    edited_at: null,
    file_url: null,
    flag_reason: null,
    metadata: null,
    original_content: null,
    reply_to_id: null,
    thread_parent_id: null
  }
];

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      const room = chatRooms.find(r => r.id === roomId);
      setCurrentRoom(room || null);
    } else if (chatRooms.length > 0) {
      setCurrentRoom(chatRooms[0]);
      navigate(`/chat/${chatRooms[0].id}`, { replace: true });
    }
  }, [roomId, chatRooms, navigate]);

  const handleSelectRoom = (room: ChatRoom) => {
    setCurrentRoom(room);
    navigate(`/chat/${room.id}`);
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!currentRoom) return;

    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        room_id: currentRoom.id,
        sender_id: 'current-user',
        sender_name: 'You',
        content,
        created_at: new Date().toISOString(),
        message_type: 'text',
        is_read: true,
        is_edited: false,
        is_flagged: false,
        thread_count: 0,
        edited_at: null,
        file_url: null,
        flag_reason: null,
        metadata: null,
        original_content: null,
        reply_to_id: null,
        thread_parent_id: null
      };

      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    // TODO: Implement new chat creation
    toast({
      title: "Feature coming soon",
      description: "New chat creation will be available soon.",
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Chat System</h2>
        <p className="text-muted-foreground mb-6">Team communication coming soon</p>
        <Button onClick={handleNewChat}>Create New Chat</Button>
      </div>
    </div>
  );
}
