
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { PinIcon, ArchiveIcon, Search, FileIcon, MessageSquareIcon, ClipboardIcon } from 'lucide-react';
import { TypingIndicator } from './dialog/TypingIndicator';
import { prepareHighlightedText } from '@/services/chat/search';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSendMessage: () => Promise<void>;
  onPinRoom: () => void;
  onArchiveRoom: () => void;
  onFlagMessage: (messageId: string, reason: string) => void;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  searchTerm?: string;
  isTyping?: boolean;
  typingUsers?: Array<{id: string, name: string}>;
  onOpenThread?: (messageId: string) => void;
  toggleSearch?: () => void;
  searchActive?: boolean;
  onViewWorkOrderDetails?: () => void;
  contentRef?: React.RefObject<HTMLDivElement>;
  children?: ReactNode;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  userId,
  newMessageText,
  setNewMessageText,
  onSendMessage,
  onPinRoom,
  onArchiveRoom,
  onFlagMessage,
  onEditMessage,
  searchTerm = '',
  isTyping = false,
  typingUsers = [],
  onOpenThread,
  toggleSearch,
  searchActive = false,
  onViewWorkOrderDetails,
  contentRef,
  children
}) => {
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of message list when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await onSendMessage();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create wrapper functions to adapt the function signatures
  const handleEditWrapper = (newContent: string, messageId: string) => {
    onEditMessage(messageId, newContent);
  };
  
  const handleFlagWrapper = (isFlagged: boolean, messageId: string) => {
    if (isFlagged) {
      onFlagMessage(messageId, "Flagged by user");
    }
  };
  
  const handleOpenThread = (messageId: string) => {
    if (onOpenThread) {
      onOpenThread(messageId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      {room && (
        <div className="p-3 border-b bg-white flex justify-between items-center">
          <div>
            <h1 className="font-medium text-lg">{room.name}</h1>
            {room.type === 'work_order' && (
              <p className="text-xs text-slate-500">
                Work Order #{room.work_order_id} 
                {onViewWorkOrderDetails && (
                  <Button variant="link" size="sm" className="p-0 ml-1 h-auto text-xs" onClick={onViewWorkOrderDetails}>
                    View Details
                  </Button>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className={searchActive ? "bg-slate-200" : ""}
              onClick={toggleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPinRoom}
              className={room.is_pinned ? "text-amber-500" : ""}
            >
              <PinIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onArchiveRoom}
              className={room.is_archived ? "text-red-500" : ""}
            >
              <ArchiveIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Messages container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
        ref={contentRef}
      >
        {room ? (
          messages.length > 0 ? (
            <>
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === userId;
                
                return (
                  <div id={`message-${message.id}`} key={message.id}>
                    <ChatMessageComponent
                      message={message}
                      isCurrentUser={isCurrentUser}
                      userId={userId}
                      onEdit={(newContent) => handleEditWrapper(newContent, message.id)}
                      onFlag={(isFlagged) => handleFlagWrapper(isFlagged, message.id)}
                      onOpenThread={() => handleOpenThread(message.id)}
                      searchTerm={searchTerm}
                    />
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {isTyping && typingUsers.length > 0 && (
                <div className="pl-2">
                  <TypingIndicator users={typingUsers} />
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquareIcon className="h-12 w-12 mb-2" />
              <p className="text-center">No messages yet</p>
              <p className="text-center text-sm">Start the conversation!</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ClipboardIcon className="h-12 w-12 mb-2" />
            <p className="text-center">Select a conversation</p>
            <p className="text-center text-sm">or start a new one</p>
          </div>
        )}
      </div>
      
      {/* Input area */}
      {room && (
        <div className="p-3 bg-white border-t">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="Type a message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={!room}
                className="w-full"
                multiline
              />
            </div>
            <div className="flex items-center">
              {children}
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessageText.trim() || isSending || !room}
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
