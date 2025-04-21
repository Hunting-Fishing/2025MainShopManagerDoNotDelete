
import React, { useRef, useEffect, useState } from 'react';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { Send, Info, Pin, Archive, Mic, Paperclip } from 'lucide-react';
import { FileUploadButton } from './file/FileUploadButton';
import { ChatThread } from './ChatThread';
import { AudioRecorder } from './AudioRecorder';

interface TypingIndicatorProps {
  typingUsers?: {id: string, name: string}[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map(user => user.name).join(', ');
  const isPlural = typingUsers.length > 1;

  return (
    <div className="text-xs text-gray-500 p-2">
      {names} {isPlural ? 'are' : 'is'} typing...
      <span className="dots-animation">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>
    </div>
  );
};

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
  onEditMessage?: (messageId: string, content: string) => void;
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
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeThreadId]);
  
  // Handle input key press (to send message on Enter)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && messageText.trim()) {
      onSendMessage();
    }
  };
  
  // Handle file message
  const handleFileSelected = async (fileUrl: string) => {
    if (onSendFileMessage) {
      onSendFileMessage(fileUrl, activeThreadId || undefined);
    }
  };
  
  // Handle voice recording
  const handleVoiceRecorded = (audioUrl: string) => {
    if (onSendVoiceMessage) {
      onSendVoiceMessage(audioUrl, activeThreadId || undefined);
      setShowVoiceRecorder(false);
    }
  };
  
  const handleCancelRecording = () => {
    setShowVoiceRecorder(false);
  };
  
  // Render empty state when no room is selected
  if (!room) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-white rounded-lg p-8 text-center">
        <div className="my-4">
          <img 
            src="/images/chat-welcome.svg" 
            alt="Welcome to Chat" 
            className="w-64 h-64 opacity-60" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Select a conversation</h2>
        <p className="text-gray-600 max-w-md">
          Choose an existing conversation from the list or start a new one to begin messaging.
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Chat header */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <div>
          <h3 className="font-semibold text-lg">{room.name}</h3>
          {room.type === 'work_order' && (
            <span className="text-xs text-blue-500">Work Order Chat</span>
          )}
        </div>
        <div className="flex space-x-2">
          {onViewInfo && (
            <Button variant="ghost" size="sm" onClick={onViewInfo}>
              <Info className="h-4 w-4" />
            </Button>
          )}
          {onPinRoom && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onPinRoom}
              className={room.is_pinned ? "text-blue-500" : ""}
            >
              <Pin className="h-4 w-4" />
            </Button>
          )}
          {onArchiveRoom && (
            <Button variant="ghost" size="sm" onClick={onArchiveRoom}>
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Chat body */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessageComponent
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === userId}
                onFlagMessage={onFlagMessage}
                onReply={onOpenThread}
                onEdit={onEditMessage}
                userId={userId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Typing indicator */}
      {typingUsers && typingUsers.length > 0 && (
        <TypingIndicator typingUsers={typingUsers} />
      )}
      
      {/* Thread view (if active) */}
      {activeThreadId && threadMessages && onCloseThread && (
        <ChatThread
          threadId={activeThreadId}
          messages={threadMessages[activeThreadId] || []}
          userId={userId}
          userName={userName}
          onClose={onCloseThread}
          onSendMessage={() => onSendMessage(activeThreadId)}
          messageText={messageText}
          setMessageText={setMessageText}
          onFlagMessage={onFlagMessage}
          onEditMessage={onEditMessage}
        />
      )}
      
      {/* Chat input */}
      {(!activeThreadId || !threadMessages) && (
        <div className="px-4 py-3 border-t">
          {showVoiceRecorder ? (
            <AudioRecorder 
              onRecordingComplete={handleVoiceRecorded}
              onCancel={handleCancelRecording}
            />
          ) : (
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow"
              />
              
              {onSendFileMessage && (
                <FileUploadButton onFileSelected={handleFileSelected} />
              )}
              
              {onSendVoiceMessage && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowVoiceRecorder(true)}
                  className="h-10 w-10"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
              
              <Button 
                onClick={() => onSendMessage()}
                disabled={!messageText.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
