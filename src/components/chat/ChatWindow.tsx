
import React, { useState, useRef, useEffect } from 'react';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Pin, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage as MessageComponent } from './ChatMessage';
import { ChatThread } from './ChatThread';
import { FileUploadButton } from './file/FileUploadButton';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (threadParentId?: string) => Promise<void>;
  onSendVoiceMessage?: (audioUrl: string, threadParentId?: string) => void;
  onSendFileMessage?: (fileUrl: string, threadParentId?: string) => Promise<void>;
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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && !activeThreadId) {
      scrollToBottom();
    }
  }, [messages, activeThreadId]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Current thread parent message
  const currentParentMessage = activeThreadId 
    ? messages.find((m) => m.id === activeThreadId)
    : null;
  
  // Current thread messages
  const currentThreadMessages = currentParentMessage && threadMessages
    ? threadMessages[activeThreadId!] || []
    : [];

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    await onSendMessage();
    scrollToBottom();
  };
  
  const handleThreadSendMessage = async () => {
    if (!messageText.trim() || !activeThreadId) return;
    await onSendMessage(activeThreadId);
  };

  const handleReply = (messageId: string) => {
    if (onOpenThread) {
      onOpenThread(messageId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeThreadId) {
        handleThreadSendMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  if (!room) {
    return (
      <div className="flex flex-col h-full justify-center items-center bg-white text-slate-500 rounded-md border">
        <div className="text-center p-6">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
          <p className="text-sm">
            Select a conversation from the sidebar or start a new chat
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full rounded-md border overflow-hidden bg-white">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h2 className="font-medium">{room.name}</h2>
          {room.type === 'work_order' && (
            <div className="text-xs text-slate-500">
              Work Order #{room.work_order_id?.substring(0, 8)}
              {onViewInfo && (
                <button 
                  className="ml-2 text-blue-500 hover:underline" 
                  onClick={onViewInfo}
                >
                  View details
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {onPinRoom && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onPinRoom} 
              className={room.is_pinned ? "text-blue-600" : ""}
            >
              <Pin className="h-4 w-4 mr-1" />
              {room.is_pinned ? 'Pinned' : 'Pin'}
            </Button>
          )}
          
          {onArchiveRoom && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onArchiveRoom}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
            <p>No messages yet</p>
            <p>Start the conversation by sending a message</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageComponent 
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === userId}
                userId={userId}
                onEdit={onEditMessage || (async () => {})}
                onFlag={onFlagMessage}
                onReply={onOpenThread ? () => handleReply(message.id) : undefined}
              />
            ))}
            {isTyping && (
              <div className="flex items-center text-sm text-slate-500 italic">
                <span className="animate-pulse mr-2">•••</span>
                <span>
                  {typingUsers && typingUsers.length > 0 
                    ? `${typingUsers.map(user => user.name).join(', ')} typing...` 
                    : 'Someone is typing...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Thread Panel */}
      {activeThreadId && currentParentMessage && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-10">
          <ChatThread 
            threadId={activeThreadId}
            messages={currentThreadMessages}
            onClose={onCloseThread || (() => {})}
            onSendReply={onSendMessage || (async () => {})}
            userId={userId}
            parentMessage={currentParentMessage}
            onEditMessage={onEditMessage || (async () => {})}
            onFlagMessage={onFlagMessage}
          />
        </div>
      )}
      
      <div className="p-3 border-t">
        {!activeThreadId && (
          <div className="flex items-center gap-2">
            {onSendFileMessage && (
              <FileUploadButton 
                roomId={room?.id || ''}
                onFileUploaded={(fileUrl, fileType) => {}}
                isDisabled={false}
                onFileSelected={onSendFileMessage}
              />
            )}
            
            <Input 
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            
            <Button 
              onClick={activeThreadId ? handleThreadSendMessage : handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
