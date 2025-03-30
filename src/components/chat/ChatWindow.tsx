
import React, { useRef, useEffect, useState } from 'react';
import { ChatRoom, ChatMessage as ChatMessageType } from '@/types/chat';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Info, Users, PaperclipIcon, Smile } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { AudioRecorder } from './AudioRecorder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onSendVoiceMessage?: (audioUrl: string) => void;
  onViewInfo?: () => void;
  onViewParticipants?: () => void;
  isTyping?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  userId,
  userName,
  messageText,
  setMessageText,
  onSendMessage,
  onSendVoiceMessage,
  onViewInfo,
  onViewParticipants,
  isTyping = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Handle file upload
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !room) return;

    try {
      setIsUploading(true);
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "The maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${room.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);
      
      // TODO: Handle sending file message
      toast({
        title: "File uploaded",
        description: "Your file has been attached to the conversation"
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle audio recording
  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (!room || !onSendVoiceMessage) return;
    
    try {
      setIsUploading(true);
      
      // Upload audio to Supabase Storage
      const filePath = `${room.id}/${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, audioBlob);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);
      
      // Send voice message
      if (urlData?.publicUrl) {
        onSendVoiceMessage(`audio:${urlData.publicUrl}`);
      }
      
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast({
        title: "Upload failed",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!room) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="text-center p-6">
          <div className="bg-slate-100 rounded-full p-6 inline-block mx-auto mb-4">
            <Send className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-slate-500 text-sm max-w-md">
            Choose an existing conversation from the sidebar or start a new one to begin messaging.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{room.name}</CardTitle>
        <div className="flex items-center space-x-2">
          {room.type === 'work_order' && onViewInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onViewInfo}>
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View work order details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onViewParticipants && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onViewParticipants}>
                    <Users className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View participants</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === userId}
              />
            ))}
            {isTyping && (
              <div className="flex ml-2 mb-4">
                <div className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.5s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 px-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileButtonClick}
            disabled={isUploading}
            className="rounded-full"
          >
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          
          <Input
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow"
            disabled={isUploading}
          />
          
          <AudioRecorder 
            onAudioRecorded={handleVoiceMessage}
            isDisabled={isUploading} 
          />
          
          <Button 
            onClick={onSendMessage} 
            disabled={!messageText.trim() || isUploading}
            className="px-3"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
