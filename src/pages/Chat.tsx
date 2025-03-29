
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useChat } from '@/hooks/useChat';
import { createChatRoom, getWorkOrderChatRoom, getDirectChatWithUser } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Chat() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Redirect to login if no user
          toast({
            title: "Authentication required",
            description: "Please sign in to use the chat feature",
            variant: "destructive",
          });
          
          navigate('/');
          return;
        }
        
        setUserId(user.id);
        
        // Get user's name from metadata or use email as fallback
        const userMeta = user.user_metadata;
        const displayName = userMeta?.full_name || 
                           (userMeta?.first_name && userMeta?.last_name 
                             ? `${userMeta.first_name} ${userMeta.last_name}` 
                             : user.email);
        
        setUserName(displayName || 'User');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to get user:', error);
        toast({
          title: "Error",
          description: "Failed to authenticate",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    
    fetchUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/');
        } else if (session?.user) {
          setUserId(session.user.id);
          const userMeta = session.user.user_metadata;
          const displayName = userMeta?.full_name || 
                             (userMeta?.first_name && userMeta?.last_name 
                               ? `${userMeta.first_name} ${userMeta.last_name}` 
                               : session.user.email);
          
          setUserName(displayName || 'User');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const {
    chatRooms,
    currentRoom,
    messages,
    loading: chatLoading,
    error,
    newMessageText,
    setNewMessageText,
    selectRoom,
    handleSendMessage,
    refreshRooms
  } = useChat({
    userId: userId || '',
    userName: userName
  });

  // Handle creating a new chat
  const handleCreateChat = async (name: string, type: 'direct' | 'group', participants: string[]) => {
    if (!userId) return;
    
    try {
      // Add current user to participants if not already included
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      
      // For direct chats, check if a chat already exists
      if (type === 'direct' && participants.length === 2) {
        const otherUserId = participants.find(id => id !== userId);
        if (otherUserId) {
          const existingRoom = await getDirectChatWithUser(userId, otherUserId);
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
    if (!userId) return;
    
    try {
      // Check if a work order chat already exists
      let workOrderRoom = await getWorkOrderChatRoom(workOrderId);
      
      // If no room exists, create one
      if (!workOrderRoom) {
        workOrderRoom = await createChatRoom(
          `Work Order: ${workOrderName}`,
          'work_order',
          [userId], // Initially just add the current user
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
    if (roomId && userId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomId);
      if (room) {
        selectRoom(room);
      } else {
        navigate('/chat');
      }
    }
  }, [roomId, chatRooms, selectRoom, navigate, userId]);

  // Handle view work order details
  const handleViewWorkOrderDetails = () => {
    if (currentRoom?.work_order_id) {
      navigate(`/work-orders/${currentRoom.work_order_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

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
            userId={userId || ''}
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
