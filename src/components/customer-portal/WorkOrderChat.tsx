
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, PaperclipIcon, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface WorkOrderChatProps {
  workOrderId: string;
  customerId: string;
  customerName: string;
  shopName: string;
}

export function WorkOrderChat({ workOrderId, customerId, customerName, shopName }: WorkOrderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Find or create a chat room for this work order
  useEffect(() => {
    async function findOrCreateChatRoom() {
      try {
        setLoading(true);
        // First, check if a chat room exists for this work order
        const { data: existingRooms, error: fetchError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('work_order_id', workOrderId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error which is expected if no chat room exists
          console.error('Error fetching chat room:', fetchError);
          setError('Failed to load chat. Please try again.');
          setLoading(false);
          return;
        }

        if (existingRooms) {
          // Chat room exists, use it
          setChatRoomId(existingRooms.id);
          await fetchMessages(existingRooms.id);
        } else {
          // Create a new chat room
          const roomName = `Work Order #${workOrderId} - ${customerName}`;
          const { data: newRoom, error: createError } = await supabase
            .from('chat_rooms')
            .insert([
              {
                name: roomName,
                type: 'work_order',
                work_order_id: workOrderId,
                metadata: {
                  work_order: {
                    id: workOrderId,
                    customer_name: customerName
                  }
                }
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating chat room:', createError);
            setError('Failed to create chat. Please try again.');
            setLoading(false);
            return;
          }

          // Now create the participants entries
          await supabase.from('chat_participants').insert([
            {
              room_id: newRoom.id,
              user_id: customerId,
              role: 'customer'
            },
            {
              room_id: newRoom.id,
              user_id: 'shop',
              role: 'shop'
            }
          ]);

          setChatRoomId(newRoom.id);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in findOrCreateChatRoom:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    }

    if (workOrderId && customerId) {
      findOrCreateChatRoom();
    }
  }, [workOrderId, customerId, customerName]);

  // Fetch messages for the chat room
  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
      setLoading(false);
      
      // Scroll to the bottom after messages are loaded
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!chatRoomId) return;

    const channel = supabase
      .channel(`chat-room-${chatRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${chatRoomId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages((prev) => [...prev, newMessage]);
        
        // If the new message is from the shop, show a toast notification
        if (newMessage.sender_id !== customerId) {
          toast({
            title: 'New message',
            description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
          });
        }
        
        // Scroll to the bottom when a new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, customerId, toast]);

  // Scroll to the bottom of the message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatRoomId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const newMsg = {
        room_id: chatRoomId,
        sender_id: customerId,
        sender_name: customerName,
        content: newMessage.trim(),
        message_type: 'text',
        is_read: false
      };
      
      const { error } = await supabase
        .from('chat_messages')
        .insert([newMsg]);
        
      if (error) throw error;
      
      // Clear the input field after sending the message
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !chatRoomId) return;
    
    try {
      setIsSubmitting(true);
      const file = files[0];
      
      // Upload the file to storage
      const filePath = `chat/${chatRoomId}/${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);
      
      if (!publicUrlData.publicUrl) throw new Error('Failed to get public URL');
      
      // Create a message with the file URL
      const newMsg = {
        room_id: chatRoomId,
        sender_id: customerId,
        sender_name: customerName,
        content: 'Sent an image',
        message_type: 'image',
        file_url: publicUrlData.publicUrl,
        is_read: false
      };
      
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert([newMsg]);
        
      if (msgError) throw msgError;
      
      // Reset the file input
      e.target.value = '';
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h3 className="text-lg font-semibold">{shopName} Chat</h3>
        <p className="text-sm text-white/80">Work Order #{workOrderId}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {loading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-start gap-2 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-16 w-[300px]" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-4">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-red-500 mb-2">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  if (chatRoomId) fetchMessages(chatRoomId);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-4">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-1">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation by sending a message below</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCustomer = message.sender_id === customerId;
            
            return (
              <div 
                key={message.id} 
                className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className={isCustomer ? 'bg-purple-600' : 'bg-blue-600'}>
                    {isCustomer ? customerName.charAt(0) : shopName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`max-w-[75%] ${isCustomer ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {isCustomer ? 'You' : message.sender_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                  
                  {message.message_type === 'image' && message.file_url ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={message.file_url} 
                        alt="Attached image" 
                        className="max-w-full h-auto max-h-60 object-contain"
                      />
                    </div>
                  ) : (
                    <div 
                      className={`p-3 rounded-lg ${
                        isCustomer 
                          ? 'bg-purple-100 text-purple-800 rounded-tr-none' 
                          : 'bg-blue-100 text-blue-800 rounded-tl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-gray-50"
      >
        <div className="flex gap-2 items-center">
          <label 
            htmlFor="image-upload" 
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-gray-600" />
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          
          <Button 
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || isSubmitting}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
      
      <style>
        {`.message-time { font-size: 0.75rem; color: #666; margin-left: 0.5rem; }`}
      </style>
    </div>
  );
}
