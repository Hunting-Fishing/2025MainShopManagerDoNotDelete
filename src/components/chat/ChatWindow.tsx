
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { Send, Mic, Paperclip, Pin, Archive, Info } from 'lucide-react';
import { ChatFileMessage } from './file/ChatFileMessage';
import { ChatThread } from './ChatThread';

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
  threadMessages,
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewInfo
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Auto-scroll to latest messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage();
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle voice message recording
  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleFinishRecording = (audioUrl: string) => {
    setIsRecording(false);
    if (onSendVoiceMessage) {
      onSendVoiceMessage(audioUrl);
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
  };

  // Handle file uploads
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onSendFileMessage) {
      setShowFileUpload(true);
    }
  };

  const handleFileUploaded = async (fileUrl: string) => {
    if (onSendFileMessage) {
      await onSendFileMessage(fileUrl);
      setShowFileUpload(false);
    }
  };

  // Get active thread message and replies if there's an active thread
  const activeThreadParent = activeThreadId 
    ? messages.find(m => m.id === activeThreadId)
    : undefined;
    
  const activeThreadReplies = activeThreadId && threadMessages
    ? threadMessages[activeThreadId] || []
    : [];

  // Show empty state if no room is selected
  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 border rounded-lg bg-white">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">
            Choose a chat from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-100 p-4 border-b">
        <div>
          <h3 className="font-medium">{room.name}</h3>
          {room.metadata?.work_order && (
            <p className="text-xs text-slate-500">
              Work Order #{room.metadata.work_order.number}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {onPinRoom && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onPinRoom} 
              title={room.is_pinned ? "Unpin conversation" : "Pin conversation"}
            >
              <Pin className={`h-4 w-4 ${room.is_pinned ? 'text-blue-600' : ''}`} />
            </Button>
          )}
          {onArchiveRoom && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onArchiveRoom} 
              title="Archive conversation"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {onViewInfo && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onViewInfo} 
              title="View details"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Chat area with thread sidebar if active */}
      <div className={`flex flex-1 overflow-hidden ${activeThreadId ? 'grid grid-cols-5' : ''}`}>
        {/* Main chat area */}
        <div className={`flex flex-col ${activeThreadId ? 'col-span-3' : 'w-full'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className="relative group">
                  {message.message_type && ['image', 'audio', 'video', 'file', 'document'].includes(message.message_type) ? (
                    <ChatFileMessage message={message} />
                  ) : (
                    <ChatMessageComponent
                      message={message}
                      isCurrentUser={message.sender_id === userId}
                      userId={userId}
                      onEdit={onEditMessage}
                      onFlag={onFlagMessage}
                      onReply={onOpenThread}
                    />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            
            {/* Typing indicator */}
            {isTyping && typingUsers && typingUsers.length > 0 && (
              <div className="flex items-center text-sm text-slate-500">
                <div className="flex items-center">
                  <span className="mr-2">
                    {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                  </span>
                  <span className="flex">
                    <span className="animate-bounce mr-0.5">.</span>
                    <span className="animate-bounce animation-delay-200 mr-0.5">.</span>
                    <span className="animate-bounce animation-delay-400">.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Message input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <>
                  <Input 
                    placeholder="Type your message..." 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  
                  {onSendVoiceMessage && (
                    <Button variant="outline" size="icon" onClick={handleStartRecording}>
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onSendFileMessage && (
                    <Button variant="outline" size="icon" onClick={handleFileClick}>
                      <Paperclip className="h-4 w-4" />
                      <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </Button>
                  )}
                  
                  <Button size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <div className="animate-pulse h-3 w-3 rounded-full bg-red-500 mr-2" />
                    <span className="text-sm text-red-600">Recording audio...</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCancelRecording}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleFinishRecording("")}>
                      Stop
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Thread sidebar */}
        {activeThreadId && activeThreadParent && onCloseThread && (
          <div className="col-span-2 border-l">
            <ChatThread 
              threadId={activeThreadId}
              parentMessage={activeThreadParent}
              messages={activeThreadReplies}
              onClose={onCloseThread}
              onSendReply={async (content, threadParentId) => {
                if (messageText.trim()) {
                  setMessageText(content);
                  await onSendMessage(threadParentId);
                  return Promise.resolve();
                }
                return Promise.resolve();
              }}
              userId={userId}
              onEditMessage={onEditMessage}
              onFlagMessage={onFlagMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
