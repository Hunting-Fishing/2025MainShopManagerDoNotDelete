import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploadButton } from '@/components/chat/file/FileUploadButton';
import { ChatFileMessage } from '@/components/chat/file/ChatFileMessage';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from "date-fns";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CustomerChatPanelProps {
  workOrderId: string;
}

export function CustomerChatPanel({ workOrderId }: CustomerChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<{id: string, name: string} | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Get current user info
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to use chat.",
            variant: "destructive"
          });
          return;
        }
        
        setUserId(session.user.id);
        
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserName(`${profile.first_name} ${profile.last_name}`);
        } else {
          setUserName(session.user.email || 'Customer');
        }
        
        // Find or create chat room for this work order
        const { data: existingRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('work_order_id', workOrderId)
          .single();
          
        if (roomError && roomError.code !== 'PGRST116') { // PGRST116 = not found
          throw roomError;
        }
        
        let roomId: string;
        
        if (existingRoom) {
          roomId = existingRoom.id;
          setChatRoom(existingRoom);
        } else {
          // Create new room
          const { data: workOrder } = await supabase
            .from('work_orders')
            .select('id, description')
            .eq('id', workOrderId)
            .single();
            
          const roomName = workOrder?.description 
            ? `Work Order: ${workOrder.description}`
            : `Work Order #${workOrderId.substring(0, 8)}`;
            
          const { data: newRoom, error: createError } = await supabase
            .from('chat_rooms')
            .insert({
              name: roomName,
              type: 'work_order',
              work_order_id: workOrderId
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          roomId = newRoom.id;
          setChatRoom(newRoom);
          
          // Add customer as participant
          await supabase
            .from('chat_participants')
            .insert({
              room_id: roomId,
              user_id: session.user.id
            });
            
          // Also add technician if assigned
          const { data: technicianData } = await supabase
            .from('work_orders')
            .select('technician_id')
            .eq('id', workOrderId)
            .single();
            
          if (technicianData?.technician_id) {
            await supabase
              .from('chat_participants')
              .insert({
                room_id: roomId,
                user_id: technicianData.technician_id
              });
          }
        }
        
        // Load messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        setMessages(messagesData || []);
        
        // Set up real-time subscription for new messages
        const channel = supabase
          .channel(`chat-room-${roomId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          }, (payload) => {
            const newMessage = payload.new as ChatMessage;
            setMessages(current => [...current, newMessage]);
          })
          .subscribe();
          
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: 'Chat Error',
          description: 'Failed to load chat. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    initChat();
  }, [workOrderId]);
  
  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom?.id || !userId || !userName) return;
    
    try {
      setSending(true);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          sender_id: userId,
          sender_name: userName,
          content: newMessage,
          message_type: 'text'
        });
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Send Failed',
        description: 'Failed to send your message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleFileUploaded = (fileUrl: string, fileType: string) => {
    // This is handled by onFileSelected, but we keep this for compatibility
    console.log('File uploaded:', fileUrl, fileType);
  };
  
  const handleFileSelected = async (fileUrl: string) => {
    if (!chatRoom?.id || !userId || !userName) return;
    
    try {
      setSending(true);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          sender_id: userId,
          sender_name: userName,
          content: `Shared a file`,
          message_type: 'file',
          file_url: fileUrl
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error sending file message:', error);
      toast({
        title: 'Send Failed',
        description: 'Failed to send your file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-md">
      {/* Chat Header */}
      <div className="p-3 border-b flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-medium">
            {chatRoom?.name || `Work Order #${workOrderId.substring(0, 8)}`}
          </h3>
          <p className="text-xs text-slate-500">
            Messages are shared with your service team
          </p>
        </div>
        {messages.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => {
            const isCustomer = message.sender_id === userId;
            
            return (
              <div key={message.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${isCustomer ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%] gap-2`}>
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className={isCustomer ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {isCustomer ? 'ME' : message.sender_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">
                        {isCustomer ? 'You' : message.sender_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <div className={`rounded-lg p-3 ${
                      isCustomer 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {message.file_url ? (
                        <ChatFileMessage message={message} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="border-t p-3">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          {chatRoom && (
            <FileUploadButton
              roomId={chatRoom.id}
              onFileUploaded={handleFileUploaded}
              onFileSelected={handleFileSelected}
              isDisabled={sending}
            />
          )}
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
