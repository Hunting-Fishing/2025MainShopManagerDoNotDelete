
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ChatMessage } from '@/types/chat';

interface WorkOrderChatProps {
  workOrderId: string;
  customerId: string;
  customerName: string;
  shopName: string;
}

export default function WorkOrderChat({ 
  workOrderId, 
  customerId, 
  customerName, 
  shopName 
}: WorkOrderChatProps) {
  const [chatRoom, setChatRoom] = useState<{ id: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find or create a chat room for this work order
  useEffect(() => {
    const findOrCreateChatRoom = async () => {
      try {
        setLoading(true);
        
        // First check if a chat room already exists for this work order
        const { data: existingRooms, error: searchError } = await supabase
          .from('chat_rooms')
          .select('id, name, type')
          .eq('work_order_id', workOrderId)
          .single();

        if (searchError && searchError.code !== 'PGSQL_NO_ROWS_RETURNED') {
          throw searchError;
        }

        if (existingRooms) {
          setChatRoom(existingRooms);
          return;
        }

        // If no room exists, create one
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `Work Order #${workOrderId.substring(0, 8)}`,
            type: 'work_order',
            work_order_id: workOrderId,
            metadata: {
              customer_id: customerId,
              customer_name: customerName,
              shop_name: shopName
            }
          })
          .select()
          .single();

        if (createError) throw createError;
        
        // Add the customer as a participant
        if (newRoom) {
          await supabase
            .from('chat_participants')
            .insert({
              room_id: newRoom.id,
              user_id: customerId
            });
            
          // Also add a system message
          await supabase
            .from('chat_messages')
            .insert({
              room_id: newRoom.id,
              sender_id: 'system',
              sender_name: 'System',
              content: `Chat created for work order #${workOrderId.substring(0, 8)}`,
              message_type: 'system' as 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread'
            });

          setChatRoom(newRoom);
        }
      } catch (error) {
        console.error('Error setting up chat room:', error);
        toast({
          variant: 'destructive',
          title: 'Chat Error',
          description: 'Failed to set up communication channel.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (workOrderId && customerId) {
      findOrCreateChatRoom();
    }
  }, [workOrderId, customerId, customerName, shopName]);

  // Load and subscribe to messages
  useEffect(() => {
    if (!chatRoom) return;

    // Load existing messages
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', chatRoom.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Convert string message_type to the appropriate union type
        const typedMessages = data.map(msg => ({
          ...msg,
          message_type: (msg.message_type || 'text') as ChatMessage['message_type']
        }));

        setMessages(typedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${chatRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${chatRoom.id}`
      }, (payload) => {
        // Ensure the new message has the correct type for message_type
        const newMessage = {
          ...payload.new,
          message_type: (payload.new.message_type || 'text') as ChatMessage['message_type']
        };
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoom]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          sender_id: customerId,
          sender_name: customerName,
          content: newMessage,
          message_type: 'text' as 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Message Error',
        description: 'Failed to send message. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Setting up your communication channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white p-3">
        <h2 className="text-lg font-semibold">Work Order Communication</h2>
        <p className="text-sm opacity-90">Chat with our service team about your work order</p>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id} 
              className={`max-w-3/4 ${
                msg.sender_id === customerId 
                  ? 'ml-auto bg-blue-600 text-white rounded-tl-lg rounded-br-lg rounded-bl-lg' 
                  : msg.sender_id === 'system'
                    ? 'mx-auto bg-slate-200 text-slate-700 italic text-sm rounded-lg'
                    : 'mr-auto bg-slate-200 text-slate-700 rounded-tr-lg rounded-br-lg rounded-bl-lg'
              } p-3`}
            >
              <p className="text-xs font-medium mb-1">
                {msg.sender_id === customerId ? 'You' : msg.sender_name}
              </p>
              <p>{msg.content}</p>
              <p className="text-xs opacity-75 text-right mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1"
          disabled={!chatRoom}
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || !chatRoom}
          size="sm"
        >
          <Send className="h-4 w-4 mr-1" />
          Send
        </Button>
      </form>
    </div>
  );
}
