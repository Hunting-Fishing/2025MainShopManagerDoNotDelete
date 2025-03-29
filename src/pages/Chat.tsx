
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useChat } from '@/hooks/useChat';
import { createChatRoom, getWorkOrderChatRoom, getDirectChatWithUser } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';

// This would normally come from an auth context
const MOCK_USER_ID = "TM001"; // Replace with actual logged-in user ID
const MOCK_USER_NAME = "John Smith"; // Replace with actual logged-in user name

export default function Chat() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  
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
    refreshRooms
  } = useChat({
    userId: MOCK_USER_ID,
    userName: MOCK_USER_NAME
  });

  // Handle creating a new chat
  const handleCreateChat = async (name: string, type: 'direct' | 'group', participants: string[]) => {
    try {
      // Add current user to participants if not already included
      if (!participants.includes(MOCK_USER_ID)) {
        participants.push(MOCK_USER_ID);
      }
      
      // For direct chats, check if a chat already exists
      if (type === 'direct' && participants.length === 2) {
        const otherUserId = participants.find(id => id !== MOCK_USER_ID);
        if (otherUserId) {
          const existingRoom = await getDirectChatWithUser(MOCK_USER_ID, otherUserId);
          if (existingRoom) {
            toast({
              title: "Chat already exists",
              description: "Opening existing conversation",
            });
            await selectRoom(existingRoom);
            navigate(`/chat/${existingRoom.id}`);
            return;
          }
        }
      }
      
      // Create a new chat room
      const newRoom = await createChatRoom(name, type, participants);
      
      // Refresh the list of chat rooms
      await refreshRooms();
      
      // Select the new room
      await selectRoom(newRoom);
      
      // Navigate to the new room
      navigate(`/chat/${newRoom.id}`);
      
      toast({
        title: "Conversation created",
        description: `New ${type === 'direct' ? 'direct message' : 'group chat'} started`,
      });
    } catch (err) {
      console.error("Error creating chat:", err);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  // Handle opening work order chat
  const openWorkOrderChat = async (workOrderId: string, workOrderName: string) => {
    try {
      // Check if a work order chat already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      // If no room exists, create one
      if (!workOrderRoom) {
        workOrderRoom = await createChatRoom(
          `Work Order: ${workOrderName}`,
          'work_order',
          [MOCK_USER_ID], // Initially just add the current user
          workOrderId
        );
        
        await refreshRooms();
      }
      
      // Select the work order room
      await selectRoom(workOrderRoom);
      
      // Navigate to the work order room
      navigate(`/chat/${workOrderRoom.id}`);
    } catch (err) {
      console.error("Error opening work order chat:", err);
      toast({
        title: "Error",
        description: "Failed to open work order chat",
        variant: "destructive",
      });
    }
  };

  // Load specified room if roomId is provided in URL
  useEffect(() => {
    if (roomId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomId);
      if (room) {
        selectRoom(room);
      } else {
        navigate('/chat');
      }
    }
  }, [roomId, chatRooms, selectRoom, navigate]);

  // Handle view work order details
  const handleViewWorkOrderDetails = () => {
    if (currentRoom?.work_order_id) {
      navigate(`/work-orders/${currentRoom.work_order_id}`);
    }
  };

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
              selectRoom(room);
              navigate(`/chat/${room.id}`);
            }}
            onNewChat={() => setShowNewChatDialog(true)}
          />
        </div>
        
        <div className="md:col-span-2">
          <ChatWindow
            room={currentRoom}
            messages={messages}
            userId={MOCK_USER_ID}
            messageText={newMessageText}
            setMessageText={setNewMessageText}
            onSendMessage={handleSendMessage}
            onViewInfo={currentRoom?.work_order_id ? handleViewWorkOrderDetails : undefined}
          />
        </div>
      </div>
      
      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onCreate={handleCreateChat}
      />
    </div>
  );
}
