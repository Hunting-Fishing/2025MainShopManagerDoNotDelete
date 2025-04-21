
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Image, Paperclip, Mic } from 'lucide-react';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageToSend, setImageToSend] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
              metadata: { 
                customer_id: customerId, 
                customer_name: customerName,
                work_order: {
                  id: workOrderId,
                  number: workOrderId.substring(0, 8),
                  status: "pending", // Default status
                  customer_name: customerName
                }
              }
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

          // Add system message
          await supabase.from('chat_messages').insert([{
            room_id: newRoom.id,
            sender_id: 'system',
            sender_name: 'System',
            content: 'Chat started for this work order. Our technicians will respond as soon as possible.',
            message_type: 'system',
            is_read: false,
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
  
  // Subscribe to typing indicators
  useEffect(() => {
    if (!chatRoom) return;
    
    const typingSubscription = supabase
      .channel(`typing-${chatRoom.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `room_id=eq.${chatRoom.id}`
      }, async () => {
        // Fetch current typing indicators
        const { data } = await supabase
          .from('chat_typing_indicators')
          .select('*')
          .eq('room_id', chatRoom.id)
          .neq('user_id', customerId);
          
        const nowMinus5Seconds = new Date(Date.now() - 5000).toISOString();
        const recentTypers = data?.filter(indicator => 
          indicator.started_at > nowMinus5Seconds
        );
        
        setIsTyping(recentTypers && recentTypers.length > 0);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(typingSubscription);
    };
  }, [chatRoom, customerId]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageToSend) || !chatRoom) return;
    
    try {
      // If there's an image to send
      if (imageToSend) {
        setIsUploading(true);
        
        // Upload the image
        const fileExt = imageToSend.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `chat-attachments/${chatRoom.id}/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('chat-files')
          .upload(filePath, imageToSend);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('chat-files')
          .getPublicUrl(filePath);
        
        // Send the message with image
        const messageToSend = {
          room_id: chatRoom.id,
          sender_id: customerId,
          sender_name: customerName,
          content: newMessage || 'Sent an image',
          message_type: 'image',
          file_url: publicUrl,
          is_read: false,
        };
        
        const { error } = await supabase
          .from('chat_messages')
          .insert([messageToSend]);
          
        if (error) throw error;
        
        // Reset image state
        setImageToSend(null);
        setImagePreviewUrl('');
        setShowImagePreview(false);
        setIsUploading(false);
      } else {
        // Text-only message
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
      }
      
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleTyping = async () => {
    if (!chatRoom) return;
    
    try {
      await supabase
        .from('chat_typing_indicators')
        .upsert({
          room_id: chatRoom.id,
          user_id: customerId,
          user_name: customerName,
          started_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating typing indicator', error);
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's an image
    if (file.type.startsWith('image/')) {
      setImageToSend(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setShowImagePreview(true);
    } else {
      // Handle other file types
      toast({
        title: "Unsupported file type",
        description: "Only image files are currently supported.",
        variant: "destructive",
      });
    }
  };
  
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Work Order Messages</h3>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-12 w-5/6" />
        </div>
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
              <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No messages yet. Send your first message to the shop.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id}
                className={`flex flex-col ${message.sender_id === customerId ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-xl ${
                    message.sender_id === customerId 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : message.sender_id === 'system'
                        ? 'bg-amber-100 text-amber-800 w-full text-center italic'
                        : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.message_type === 'image' && message.file_url && (
                    <a 
                      href={message.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mb-2"
                    >
                      <img 
                        src={message.file_url} 
                        alt="Attached image" 
                        className="max-w-full max-h-48 rounded"
                      />
                    </a>
                  )}
                  {message.content}
                </div>
                {message.sender_id !== 'system' && (
                  <span className="text-xs text-gray-500 mt-1">
                    {message.sender_id === customerId ? 'You' : message.sender_name} • {formatTime(message.created_at)}
                  </span>
                )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-gray-100 text-gray-700 rounded-xl px-4 py-2 max-w-[80%] text-sm">
                <span className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
          {showImagePreview && imagePreviewUrl && (
            <div className="relative bg-gray-100 p-2 rounded mb-2 flex items-center">
              <img src={imagePreviewUrl} alt="Preview" className="h-16 rounded" />
              <Button 
                variant="ghost" 
                size="sm"
                type="button"
                className="absolute top-1 right-1 h-6 w-6 p-1 rounded-full bg-gray-800/80 text-white"
                onClick={() => {
                  setImageToSend(null);
                  setImagePreviewUrl('');
                  setShowImagePreview(false);
                }}
              >
                ✕
              </Button>
              <span className="ml-2 text-sm">Ready to send</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={() => handleTyping()}
              placeholder="Type your message..."
              disabled={isUploading}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={handleFileSelect}
              disabled={isUploading}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button 
              type="submit" 
              disabled={(!newMessage.trim() && !imageToSend) || isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </form>
      </div>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #888;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
