import React, { useRef, useEffect, useState } from 'react';
import { ChatRoom, ChatMessage as ChatMessageType } from '@/types/chat';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Info, Users, Smile, TagIcon, MoreVertical, AlertCircle, Bookmark } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { AudioRecorder } from './AudioRecorder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { uploadVoiceRecording, formatFileMessage } from '@/services/chat/fileService';
import { FileUploadButton } from './file/FileUploadButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onSendVoiceMessage?: (audioUrl: string) => void;
  onSendFileMessage?: (fileMessage: string) => void;
  onViewInfo?: () => void;
  onViewParticipants?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
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
  onSendFileMessage,
  onViewInfo,
  onViewParticipants,
  onFlagMessage,
  onPinRoom,
  onArchiveRoom,
  isTyping = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showWorkOrderMenu, setShowWorkOrderMenu] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (!room) return;
    
    try {
      setIsUploading(true);
      const fileInfo = await uploadVoiceRecording(room.id, audioBlob);
      
      if (fileInfo && onSendFileMessage) {
        onSendFileMessage(formatFileMessage(fileInfo));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUploaded = (fileUrl: string, fileType: string, caption?: string) => {
    if (onSendFileMessage) {
      onSendFileMessage(fileUrl + (caption ? `|${caption}` : ''));
    }
  };

  const renderWorkOrderOptions = () => {
    if (!room?.work_order_id) return null;
    
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowWorkOrderMenu(!showWorkOrderMenu)}
        className="relative"
      >
        <TagIcon className="h-5 w-5" />
        {showWorkOrderMenu && (
          <div className="absolute top-full right-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-64">
            <div className="text-sm font-medium mb-2">Work Order Actions</div>
            <Button variant="outline" size="sm" className="w-full justify-start mb-1">
              <AlertCircle className="h-4 w-4 mr-2" />
              Flag for Attention
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start mb-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Save to Vehicle History
            </Button>
          </div>
        )}
      </Button>
    );
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
        <div className="flex items-center">
          <CardTitle className="text-lg">
            {room.name}
          </CardTitle>
          {room.type === 'work_order' && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Work Order
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPinRoom && (
                <DropdownMenuItem onClick={onPinRoom}>
                  {room.is_pinned ? 'Unpin Conversation' : 'Pin Conversation'}
                </DropdownMenuItem>
              )}
              {onArchiveRoom && (
                <DropdownMenuItem onClick={onArchiveRoom}>
                  {room.is_archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => {/* Add mute functionality */}}>
                Mute Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* Add search functionality */}}>
                Search in Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                onFlagMessage={onFlagMessage}
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
          <FileUploadButton
            roomId={room.id}
            onFileUploaded={handleFileUploaded}
            isDisabled={isUploading}
          />
          
          <Input
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow"
            disabled={isUploading}
          />
          
          {renderWorkOrderOptions()}
          
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
