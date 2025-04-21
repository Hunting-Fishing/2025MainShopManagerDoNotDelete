import React, { useRef, useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Info } from 'lucide-react';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { AudioRecorder } from './AudioRecorder';
import { FileUploadButton } from './file/FileUploadButton';
import { ChatThread } from './ChatThread';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (threadParentId?: string) => void;
  onSendVoiceMessage?: (audioUrl: string, threadParentId?: string) => void;
  onSendFileMessage?: (fileUrl: string, threadParentId?: string) => void;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onEditMessage?: (messageId: string, content: string) => Promise<void>;
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
  threadMessages,
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewInfo
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (room) {
      inputRef.current?.focus();
    }
  }, [room]);
  
  useEffect(() => {
    if (isTyping && typingUsers && typingUsers.length > 0) {
      setShowTypingIndicator(true);
      const timer = setTimeout(() => {
        setShowTypingIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isTyping, typingUsers]);
  
  const getTypingText = () => {
    if (!typingUsers || typingUsers.length === 0) return '';
    
    const nonUserTyping = typingUsers.filter(user => user.id !== userId);
    
    if (nonUserTyping.length === 0) return '';
    if (nonUserTyping.length === 1) return `${nonUserTyping[0].name} is typing...`;
    if (nonUserTyping.length === 2) return `${nonUserTyping[0].name} and ${nonUserTyping[1].name} are typing...`;
    return 'Several people are typing...';
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileUpload = async (fileUrl: string) => {
    if (onSendFileMessage) {
      onSendFileMessage(fileUrl);
    }
  };

  const handleVoiceMessage = (audioUrl: string) => {
    if (onSendVoiceMessage) {
      onSendVoiceMessage(audioUrl);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    if (onEditMessage) {
      await onEditMessage(messageId, content);
    }
  };

  const getEmptyStateText = () => {
    if (!room) return 'Select a conversation to start chatting';
    return 'No messages yet. Start the conversation!';
  };
  
  const renderThread = () => {
    if (!activeThreadId || !threadMessages || !threadMessages[activeThreadId]) {
      return null;
    }
    
    const parentMessage = messages.find(m => m.id === activeThreadId);
    if (!parentMessage) return null;
    
    return (
      <ChatThread
        parentMessage={parentMessage}
        messages={threadMessages[activeThreadId]}
        onClose={onCloseThread}
        onSendMessage={() => onSendMessage(activeThreadId)}
        messageText={messageText}
        setMessageText={setMessageText}
        userId={userId}
        onEditMessage={handleEditMessage}
        onFlagMessage={onFlagMessage}
      />
    );
  };

  if (!room) {
    return (
      <Card className="h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {getEmptyStateText()}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden border-slate-200">
      <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-950">
        <div>
          <h3 className="font-medium">{room.name || 'Chat'}</h3>
          {room.description && (
            <p className="text-sm text-slate-500">{room.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onViewInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewInfo}
              className="flex items-center gap-1"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500">{getEmptyStateText()}</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === userId;
              
              if (message.message_type === 'thread' || message.thread_parent_id) {
                return null;
              }
              
              if (message.message_type === 'file' || message.message_type === 'image' || 
                  message.message_type === 'audio' || message.message_type === 'video') {
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <ChatFileMessage message={message} />
                  </div>
                );
              }
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <ChatMessage
                    message={message}
                    isCurrentUser={isCurrentUser}
                    onEdit={onEditMessage}
                    onFlag={onFlagMessage}
                    onReply={onOpenThread}
                    userId={userId}
                  />
                </div>
              );
            })}
            
            {showTypingIndicator && (
              <div className="text-sm text-slate-500 italic">
                {getTypingText()}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {renderThread()}
      
      <div className="p-4 border-t bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <AudioRecorder 
            onAudioRecorded={(blob) => {
              const audioUrl = URL.createObjectURL(blob);
              handleVoiceMessage(audioUrl);
            }}
            isDisabled={!room}
          />
          
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
            disabled={!room}
            className="flex-1"
          />
          
          <FileUploadButton
            roomId={room.id}
            onFileUploaded={handleFileUpload}
            isDisabled={!room}
          />
          
          <Button 
            onClick={() => onSendMessage()}
            disabled={!messageText.trim() || !room}
            size="icon"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
