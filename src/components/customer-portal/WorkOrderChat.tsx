
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image as ImageIcon, Paperclip, Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { transformDatabaseMessage, validateMessageType } from '@/services/chat/message/types';

interface WorkOrderChatProps {
  workOrderId: string;
  customerName: string;
  customerId: string;
  shopName: string; // Added missing prop
}

export const WorkOrderChat: React.FC<WorkOrderChatProps> = ({
  workOrderId,
  customerName,
  customerId,
  shopName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find or create a chat room for this work order
  useEffect(() => {
    const findOrCreateChatRoom = async () => {
      // First check if a room exists for this work order
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('work_order_id', workOrderId)
        .single();

      if (findError && findError.code !== 'PGSQL_NO_ROWS_RETURNED') {
        console.error('Error finding chat room:', findError);
        return;
      }

      if (existingRoom) {
        setRoomId(existingRoom.id);
        return existingRoom.id;
      }

      // Create a new room if none exists
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `Work Order Discussion #${workOrderId.substring(0, 8)}`,
          type: 'work_order',
          work_order_id: workOrderId,
          metadata: {
            work_order: {
              id: workOrderId,
            },
          },
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat room:', createError);
        return null;
      }

      // Add the customer as a participant
      if (newRoom) {
        const { error: participantError } = await supabase
          .from('chat_participants')
          .insert([
            {
              room_id: newRoom.id,
              user_id: customerId,
            },
            {
              room_id: newRoom.id,
              user_id: 'shop', // Representing the shop side
            },
          ]);

        if (participantError) {
          console.error('Error adding participants:', participantError);
        }

        setRoomId(newRoom.id);
        return newRoom.id;
      }

      return null;
    };

    findOrCreateChatRoom();
  }, [workOrderId, customerId]);

  // Load messages when room is available
  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Transform the messages to ensure they match the ChatMessage type
        const typedMessages = data.map(msg => ({
          ...msg,
          message_type: validateMessageType(msg.message_type) // Convert string to proper type
        })) as ChatMessage[];

        setMessages(typedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchMessages();

      // Subscribe to new messages
      const channel = supabase
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const newMessage = payload.new as any;
            // Transform the incoming message to ensure it matches ChatMessage type
            const typedMessage = {
              ...newMessage,
              message_type: validateMessageType(newMessage.message_type)
            } as ChatMessage;
            
            setMessages((prev) => [...prev, typedMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    try {
      const messageData = {
        room_id: roomId,
        sender_id: customerId,
        sender_name: customerName,
        content: newMessage,
        message_type: 'text' as const, // Using const assertion to satisfy the type
      };

      const { error } = await supabase.from('chat_messages').insert(messageData);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    try {
      setIsUploading(true);

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-attachments/${roomId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(filePath);

      // Determine message type based on file type
      let messageType: 'image' | 'file' | 'audio' | 'video' = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('audio/')) messageType = 'audio';
      else if (file.type.startsWith('video/')) messageType = 'video';

      // Send message with file reference
      const messageData = {
        room_id: roomId,
        sender_id: customerId,
        sender_name: customerName,
        content: `Shared a ${messageType}`,
        message_type: messageType,
        file_url: urlData.publicUrl,
      };

      const { error: msgError } = await supabase.from('chat_messages').insert(messageData);

      if (msgError) throw msgError;
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4 flex items-center shadow-sm">
        <h3 className="text-lg font-semibold">Work Order Support Chat</h3>
      </div>

      <div className="flex-grow overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full flex-col">
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">
              Start the conversation with {shopName}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === customerId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === customerId
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center mb-1 gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={`text-xs ${
                        message.sender_id === customerId
                          ? 'bg-blue-300'
                          : 'bg-green-300'
                      }`}>
                        {getInitials(message.sender_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{message.sender_name}</span>
                    <span className="text-xs opacity-50">
                      {format(new Date(message.created_at), 'hh:mm a')}
                    </span>
                  </div>

                  {message.message_type === 'image' ? (
                    <div className="mt-1">
                      <img 
                        src={message.file_url} 
                        alt="Shared image" 
                        className="max-w-full rounded"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  ) : message.message_type === 'file' ? (
                    <div className="mt-1">
                      <a 
                        href={message.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Paperclip size={16} />
                        <span>Attachment</span>
                      </a>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 items-center">
        <label htmlFor="file-upload" className="cursor-pointer">
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Paperclip
            className={`h-5 w-5 text-gray-500 hover:text-blue-500 ${
              isUploading ? 'opacity-50' : ''
            }`}
          />
        </label>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button type="submit" size="sm" disabled={!newMessage.trim() || isUploading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <style>
        {`.emoji-mart {
          position: absolute;
          bottom: 60px;
          right: 20px;
          z-index: 100;
        }`}
      </style>
    </div>
  );
};
