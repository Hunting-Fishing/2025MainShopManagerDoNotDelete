
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { CustomerMessage } from './CustomerMessage';
import { useToast } from '@/hooks/use-toast';

interface CustomerChatPanelProps {
  customerId: string;
  customerName: string;
}

export const CustomerChatPanel: React.FC<CustomerChatPanelProps> = ({ customerId, customerName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const { toast } = useToast();

  // Find or create chat room for this customer
  useEffect(() => {
    const fetchOrCreateChatRoom = async () => {
      try {
        // First try to find an existing room for this customer
        const { data: existingRooms } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('type', 'direct')
          .contains('metadata', { customer_id: customerId });
        
        if (existingRooms && existingRooms.length > 0) {
          setRoomId(existingRooms[0].id);
          return;
        }
        
        // If no room exists, create one
        const { data: newRoom, error } = await supabase
          .from('chat_rooms')
          .insert({
            name: `Chat with ${customerName}`,
            type: 'direct',
            metadata: { 
              customer_id: customerId,
              is_customer_chat: true
            }
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Add the customer as a participant
        await supabase
          .from('chat_participants')
          .insert({
            room_id: newRoom.id,
            user_id: customerId,
            role: 'customer'
          });
        
        // Add the system as a participant (representing staff)
        await supabase
          .from('chat_participants')
          .insert({
            room_id: newRoom.id,
            user_id: 'system',
            role: 'staff'
          });
        
        setRoomId(newRoom.id);
        
      } catch (err) {
        console.error('Error setting up chat room:', err);
        toast({
          title: 'Chat Error',
          description: 'Could not set up chat. Please try again later.',
          variant: 'destructive'
        });
      }
    };
    
    if (customerId) {
      fetchOrCreateChatRoom();
    }
  }, [customerId, customerName, toast]);
  
  // Fetch messages for the room
  useEffect(() => {
    if (!roomId) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          // Convert the message_type string to the expected union type
          const typedMessages = data.map(msg => ({
            ...msg,
            message_type: (msg.message_type || 'text') as "audio" | "video" | "image" | "text" | "file" | "system" | "work_order" | "thread"
          }));
          
          setMessages(typedMessages as ChatMessage[]);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, payload => {
        const newMessage = payload.new as any;
        
        // Convert message_type to the expected union type
        const typedMessage = {
          ...newMessage,
          message_type: (newMessage.message_type || 'text') as "audio" | "video" | "image" | "text" | "file" | "system" | "work_order" | "thread"
        };
        
        setMessages(currentMessages => [...currentMessages, typedMessage] as ChatMessage[]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: customerId,
          sender_name: customerName,
          content: newMessage,
          message_type: 'text'
        });
      
      if (error) throw error;
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Message Error',
        description: 'Could not send message. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full border rounded-lg shadow-sm overflow-hidden">
      <div className="bg-primary text-white p-4">
        <h3 className="text-lg font-medium">Customer Support Chat</h3>
        <p className="text-sm opacity-80">Get help from our support team</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map(message => (
            <CustomerMessage 
              key={message.id} 
              message={message} 
              isCustomer={message.sender_id === customerId} 
            />
          ))
        )}
      </div>
      
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon" 
            className="h-auto"
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
