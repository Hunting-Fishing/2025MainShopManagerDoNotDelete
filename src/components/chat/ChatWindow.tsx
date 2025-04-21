
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage as ChatMessageType, ChatRoom } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Info,
  Pin,
  ArchiveIcon,
  PinIcon,
  MessageSquare,
  X
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from './ChatMessage';
import { AudioRecorder } from './AudioRecorder';
import { FileUploadButton } from './file/FileUploadButton';
import { ChatThread } from './ChatThread';
import { Badge } from '@/components/ui/badge';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
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
  threadMessages?: {[key: string]: ChatMessageType[]};
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
  typingUsers = [],
  threadMessages = {},
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewInfo
}) => {
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus textarea when room changes
  useEffect(() => {
    textAreaRef.current?.focus();
  }, [room]);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };
  
  const handleReply = (messageId: string) => {
    if (onOpenThread) {
      onOpenThread(messageId);
    }
  };

  // File upload handler
  const handleFileUpload = async (fileUrl: string) => {
    if (onSendFileMessage) {
      await onSendFileMessage(fileUrl);
    }
  };

  // Audio recorder handlers
  const handleStartRecording = () => {
    setShowAudioRecorder(true);
  };

  const handleStopRecording = async (audioBlob: Blob) => {
    setShowAudioRecorder(false);
    if (onSendVoiceMessage) {
      // Convert the blob to a URL
      const audioUrl = URL.createObjectURL(audioBlob);
      await onSendVoiceMessage(audioUrl);
    }
  };

  const handleCancelRecording = () => {
    setShowAudioRecorder(false);
  };
  
  if (!room) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-4 h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <MessageSquare className="h-12 w-12 mx-auto opacity-20 mb-2" />
          <h3 className="text-lg font-semibold mb-1">No conversation selected</h3>
          <p className="text-sm">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{room.name}</h3>
            {room.work_order_id && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                Work Order
              </Badge>
            )}
          </div>
          {room.metadata?.work_order && (
            <div className="text-xs text-slate-500">
              <span>Status: {room.metadata.work_order.status}</span> • 
              <span> Customer: {room.metadata.work_order.customer_name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {onViewInfo && (
            <Button variant="ghost" size="sm" onClick={onViewInfo} className="text-slate-600">
              <Info className="h-4 w-4 mr-1" />
              View Details
            </Button>
          )}
          
          {onPinRoom && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onPinRoom}
              className={room.is_pinned ? "text-amber-500" : ""}
            >
              <PinIcon className="h-4 w-4" />
              <span className="sr-only">
                {room.is_pinned ? 'Unpin conversation' : 'Pin conversation'}
              </span>
            </Button>
          )}
          
          {onArchiveRoom && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onArchiveRoom}
            >
              <ArchiveIcon className="h-4 w-4" />
              <span className="sr-only">Archive conversation</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage 
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === userId}
                userId={userId}
                onEdit={onEditMessage}
                onFlag={onFlagMessage}
                onReply={onOpenThread ? handleReply : undefined}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-slate-500 italic">
          {typingUsers.length === 1 
            ? `${typingUsers[0].name} is typing...` 
            : `${typingUsers.length} people are typing...`
          }
        </div>
      )}
      
      {/* Thread view */}
      {activeThreadId && threadMessages[activeThreadId] && onCloseThread && (
        <div className="absolute right-4 top-24 bottom-24 w-80 z-10">
          <ChatThread 
            threadId={activeThreadId}
            messages={threadMessages[activeThreadId]} 
            userId={userId}
            onClose={onCloseThread}
            onSendReply={(content, threadParentId) => {
              setMessageText(content);
              return onSendMessage(threadParentId);
            }}
            onEditMessage={onEditMessage}
            onFlagMessage={onFlagMessage}
            parentMessage={messages.find(m => m.id === activeThreadId)}
          />
        </div>
      )}
      
      {/* Message input */}
      <div className="p-3 border-t">
        {showAudioRecorder ? (
          <AudioRecorder
            onAudioRecorded={handleStopRecording}
            isDisabled={false}
            onCancel={handleCancelRecording}
          />
        ) : (
          <div className="flex gap-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="resize-none min-h-[60px]"
              ref={textAreaRef}
            />
            <div className="flex flex-col justify-end gap-2">
              <FileUploadButton
                roomId={room.id}
                onFileUploaded={handleFileUpload}
              />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStartRecording}
                className="rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>
                <span className="sr-only">Record voice message</span>
              </Button>
              
              <Button 
                size="icon" 
                onClick={() => onSendMessage()} 
                disabled={!messageText.trim()}
                className="rounded-full"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
