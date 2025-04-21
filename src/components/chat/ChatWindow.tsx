
import React, { useState, useRef, useEffect } from 'react';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Pin, 
  Archive, 
  SendHorizonal as Send, 
  Info, 
  X,
  MessageSquare
} from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { ChatThread } from './ChatThread';
import { FileUploadButton } from './file/FileUploadButton';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (threadParentId?: string) => Promise<void>;
  onSendVoiceMessage?: (audioUrl: string, threadParentId?: string) => Promise<void>;
  onSendFileMessage?: (fileUrl: string, threadParentId?: string) => Promise<void>;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  isTyping?: boolean;
  typingUsers?: {id: string, name: string}[];
  threadMessages?: {[key: string]: ChatMessage[]};
  activeThreadId?: string | null;
  onOpenThread?: (messageId: string) => void;
  onCloseThread?: () => void;
  onViewInfo?: () => void;
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
  onPinRoom,
  onArchiveRoom,
  onFlagMessage,
  onEditMessage,
  isTyping,
  typingUsers,
  threadMessages = {},
  activeThreadId = null,
  onOpenThread,
  onCloseThread,
  onViewInfo
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThreadViewActive, setIsThreadViewActive] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Set thread view active state based on activeThreadId
  useEffect(() => {
    setIsThreadViewActive(!!activeThreadId);
  }, [activeThreadId]);
  
  const handleSendMessage = async () => {
    if (onSendMessage) {
      await onSendMessage();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendVoiceMessage = async (audioUrl: string) => {
    if (onSendVoiceMessage) {
      await onSendVoiceMessage(audioUrl);
    }
  };
  
  const handleSendFileMessage = async (fileUrl: string) => {
    if (onSendFileMessage) {
      await onSendFileMessage(fileUrl);
    }
  };
  
  if (!room) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-medium">No Conversation Selected</h3>
          <p className="mt-2 text-sm text-slate-500">
            Choose a conversation from the list or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // Get parent message for thread if we have an active thread
  const parentMessage = activeThreadId 
    ? messages.find(msg => msg.id === activeThreadId)
    : undefined;
  
  // Filter out thread messages from main view if they are being shown in thread view
  const filteredMessages = messages.filter(msg => 
    !msg.thread_parent_id || !activeThreadId || msg.thread_parent_id !== activeThreadId
  );
  
  // Get thread messages for current active thread
  const currentThreadMessages = activeThreadId ? threadMessages[activeThreadId] || [] : [];

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div>
          <h3 className="font-medium">{room.name}</h3>
          {room.type === 'work_order' && room.metadata?.work_order && (
            <div className="flex items-center mt-1">
              <span className={`
                inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                ${room.metadata.work_order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 
                  room.metadata.work_order.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  room.metadata.work_order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-slate-100 text-slate-800 border-slate-300'}
                border
              `}>
                {room.metadata.work_order.status}
              </span>
              <span className="text-sm text-slate-500 ml-2">{room.metadata.work_order.customer_name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {room.type === 'work_order' && onViewInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onViewInfo}
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View work order details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onPinRoom && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onPinRoom}
                    className={room.is_pinned ? "text-blue-500" : ""}
                  >
                    <Pin className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{room.is_pinned ? 'Unpin' : 'Pin'} conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onArchiveRoom && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onArchiveRoom}
                  >
                    <Archive className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Chat Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Messages */}
        <div className={`flex-1 overflow-y-auto p-4 ${isThreadViewActive ? 'hidden md:block' : ''}`}>
          {filteredMessages.map((message) => (
            <div 
              key={message.id} 
              className="mb-4"
              onClick={() => message.thread_count && message.thread_count > 0 && onOpenThread && onOpenThread(message.id)}
            >
              {/* Use the ChatMessage component here to render each message */}
              {/* For simplicity, we're using a placeholder implementation */}
              <div className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_id === userId 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">
                      {message.sender_id === userId ? 'You' : message.sender_name}
                    </span>
                    {message.thread_count && message.thread_count > 0 && (
                      <div className="flex items-center gap-1 text-xs cursor-pointer">
                        <MessageSquare className="h-3 w-3" />
                        <span>{message.thread_count}</span>
                      </div>
                    )}
                  </div>
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {/* Typing indicator */}
          {isTyping && typingUsers && typingUsers.length > 0 && (
            <div className="text-sm text-slate-500 italic mb-2">
              {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
        </div>
        
        {/* Thread View */}
        {isThreadViewActive && activeThreadId && onCloseThread && (
          <div className={`${isThreadViewActive ? 'flex-1 md:w-1/2 md:flex-none' : 'hidden'} border-l`}>
            <ChatThread
              threadId={activeThreadId}
              messages={currentThreadMessages}
              onClose={onCloseThread}
              onSendReply={(content, threadId) => {
                setMessageText(content);
                return onSendMessage(threadId);
              }}
              userId={userId}
              parentMessage={parentMessage}
              onEditMessage={onEditMessage}
              onFlagMessage={onFlagMessage}
            />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="border-t p-3">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-20"
            />
            <div className="absolute right-2 top-2 flex space-x-1">
              {onSendVoiceMessage && (
                <AudioRecorder
                  onAudioRecorded={handleSendVoiceMessage}
                  isDisabled={!room}
                />
              )}
              {onSendFileMessage && (
                <FileUploadButton
                  roomId={room.id}
                  onFileUploaded={handleSendFileMessage}
                  isDisabled={!room}
                />
              )}
            </div>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || !room}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
