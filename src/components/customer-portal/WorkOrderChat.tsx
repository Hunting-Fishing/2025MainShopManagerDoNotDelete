import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface WorkOrderChatProps {
  workOrderId: string;
  customerName: string;
  customerId: string;
}

export const WorkOrderChat: React.FC<WorkOrderChatProps> = ({
  workOrderId,
  customerName,
  customerId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find or create a chat room for this work order
  useEffect(() => {
    const fetchOrCreateChatRoom = async () => {
      try {
        // First, check if a chat room already exists for this work order
        const { data: existingRooms, error: fetchError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('work_order_id', workOrderId)
          .limit(1);
          
        if (fetchError) {
          throw fetchError;
        }
        
        let room: ChatRoom | null = null;
        
        // If room exists, use it
        if (existingRooms && existingRooms.length > 0) {
          room = existingRooms[0];
          setChatRoom(room);
        } else {
          // Otherwise create a new room
          const roomName = `Work Order #${workOrderId.substring(0, 8)}`;
          const { data: newRoom, error: createError } = await supabase
            .from('chat_rooms')
            .insert([{
              name: roomName,
              type: 'work_order',
              work_order_id: workOrderId,
              metadata: { customer_id: customerId, customer_name: customerName }
            }])
            .select()
            .single();
            
          if (createError) {
            throw createError;
          }
          
          room = newRoom;
          setChatRoom(newRoom);
          
          // Add customer as participant
          await supabase.from('chat_participants').insert([{
            room_id: newRoom.id,
            user_id: customerId,
          }]);
        }

        // Load messages for the room
        if (room) {
          const { data: chatMessages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: true });
            
          if (messagesError) {
            throw messagesError;
          }
          
          setMessages(chatMessages || []);
        }
      } catch (error: any) {
        console.error('Error setting up chat:', error);
        toast({
          title: "Chat Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (workOrderId && customerId) {
      fetchOrCreateChatRoom();
    }
  }, [workOrderId, customerId, customerName]);
  
  // Subscribe to new messages
  useEffect(() => {
    if (!chatRoom) return;
    
    const messageSubscription = supabase
      .channel(`room-${chatRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${chatRoom.id}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages((currentMessages) => [...currentMessages, newMessage]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [chatRoom]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom) return;
    
    try {
      const messageToSend = {
        room_id: chatRoom.id,
        sender_id: customerId,
        sender_name: customerName,
        content: newMessage,
        is_read: false,
      };
      
      const { error } = await supabase
        .from('chat_messages')
        .insert([messageToSend]);
        
      if (error) {
        throw error;
      }
      
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Work Order Messages</h3>
        </div>
      </div>
      
      <div className="p-4 h-[400px] flex flex-col">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet. Send your first message to the shop.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id}
                className={`flex flex-col ${message.sender_id === customerId ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[80%] px-4 py-2 rounded-xl ${
                  message.sender_id === customerId 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  {message.content}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {message.sender_name} • {formatTime(message.created_at)}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
