import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { ChatMessage as ChatMessageType, ChatRoom } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Pin, Archive, FileDown, MessageSquare, Clipboard } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './dialog/TypingIndicator';
import { prepareHighlightedText } from '@/services/chat/search';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
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
  typingUsers: Array<{id: string, name: string}>;
  onOpenThread?: (messageId: string) => void;
  toggleSearch?: () => void;
  searchActive?: boolean;
  onViewWorkOrderDetails?: () => void;
  contentRef?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
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
              <Pin className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onArchiveRoom}
              className={room.is_archived ? "text-red-500" : ""}
            >
              <Archive className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4" ref={contentRef}>
        {room ? (
          messages.length > 0 ? (
            <>
              {messages.map((message) => {
                const isCurrentUser = message.sender_id === userId;
                
                return (
                  <div id={`message-${message.id}`} key={message.id}>
                    <ChatMessage
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
              
              {isTyping && typingUsers.length > 0 && (
                <div className="px-4 py-2">
                  <TypingIndicator typingUsers={typingUsers} />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare className="h-12 w-12 mb-2" />
              <p className="text-center">No messages yet</p>
              <p className="text-center text-sm">Start the conversation!</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Clipboard className="h-12 w-12 mb-2" />
            <p className="text-center">Select a conversation</p>
            <p className="text-center text-sm">or start a new one</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!room}
            className="flex-1 min-h-[40px] max-h-[120px]"
            rows={1}
          />
          
          {children}
          
          <Button 
            onClick={handleSendMessage} 
            disabled={!room || !newMessageText.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
