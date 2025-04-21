import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatRoom, ChatMessage as ChatMessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Pin, Archive, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatThread } from './ChatThread';
import { AudioRecorder } from './AudioRecorder';
import { FileUploadButton } from './file/FileUploadButton';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (threadParentId?: string) => Promise<void>;
  onSendVoiceMessage?: (audioUrl: string, threadParentId?: string) => void;
  onSendFileMessage?: (fileUrl: string, threadParentId?: string) => void;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onEditMessage?: (messageId: string, content: string) => Promise<void>;
  isTyping?: boolean;
  typingUsers?: {id: string, name: string}[];
  threadMessages?: {[key: string]: ChatMessageType[]};
  activeThreadId?: string | null;
  onOpenThread?: (messageId: string) => void;
  onCloseThread?: () => void;
  onViewInfo?: () => void;
  onTyping?: () => void;
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
  onViewInfo,
  onTyping
}) => {
  const [isPinning, setIsPinning] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Add this function for handling thread messages
  const handleSendThreadReply = async (content: string, parentId: string) => {
    if (onSendMessage) {
      await onSendMessage(parentId);
    }
  };

  const handlePinRoom = async () => {
    if (!room || !onPinRoom) return;
    setIsPinning(true);
    try {
      await onPinRoom();
    } finally {
      setIsPinning(false);
    }
  };

  const handleArchiveRoom = async () => {
    if (!room || !onArchiveRoom) return;
    setIsArchiving(true);
    try {
      await onArchiveRoom();
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!onSendVoiceMessage) return;
    
    const audioUrl = URL.createObjectURL(audioBlob);
    await onSendVoiceMessage(audioUrl);
  };
  
  const handleSendFile = async (fileUrl: string) => {
    if (!onSendFileMessage) return;
    
    await onSendFileMessage(fileUrl);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (onSendMessage) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="bg-slate-50 border-b p-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{room ? room.name : 'Select a conversation'}</h3>
        <div className="flex items-center space-x-2">
          {onViewInfo && (
            <Button variant="ghost" size="sm" onClick={onViewInfo}>
              View Info
            </Button>
          )}
          {room && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePinRoom}
                disabled={isPinning}
              >
                <Pin className="h-4 w-4" />
                <span className="sr-only">{room.is_pinned ? 'Unpin' : 'Pin'} conversation</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleArchiveRoom}
                disabled={isArchiving}
              >
                <Archive className="h-4 w-4" />
                <span className="sr-only">{room.is_archived ? 'Unarchive' : 'Archive'} conversation</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeThreadId && threadMessages && threadMessages[activeThreadId] ? (
          <div className="h-full">
            <ChatThread
              threadId={activeThreadId}
              messages={threadMessages[activeThreadId]}
              onClose={onCloseThread || (() => {})}
              onSendReply={handleSendThreadReply}
              userId={userId}
              parentMessage={messages.find(m => m.id === activeThreadId)}
              onEditMessage={onEditMessage || (async () => {})}
              onFlagMessage={onFlagMessage}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center absolute top-0 left-0 w-full h-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {room ? null : 'Select a conversation to start messaging'}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
              {messages.length === 0 && room ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No messages in this conversation yet.
                </div>
              ) : null}
              
              {messages.map(msg => {
                if (msg.message_type === 'file' || msg.message_type === 'image' || 
                    msg.message_type === 'audio' || msg.message_type === 'video') {
                  return (
                    <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-[80%] rounded-lg ${
                        msg.sender_id === userId 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        <ChatMessage message={msg} isCurrentUser={msg.sender_id === userId} userId={userId} onEdit={onEditMessage || (async () => {})} onFlag={onFlagMessage} onReply={onOpenThread} />
                      </div>
                    </div>
                  );
                }
                
                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.sender_id === userId}
                    userId={userId}
                    onEdit={onEditMessage || (async () => {})}
                    onFlag={onFlagMessage}
                    onReply={onOpenThread}
                  />
                );
              })}

              {typingUsers && typingUsers.length > 0 && (
                <div className="flex items-center mt-2 space-x-2">
                  {typingUsers.map(user => (
                    <div key={user.id} className="text-sm text-slate-500">
                      {user.name} is typing...
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="border-t p-3">
        {!room ? (
          <div className="text-center text-slate-400">
            Select a conversation to start messaging
          </div>
        ) : null}
        
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder={isTyping ? 'Typing...' : 'Type your message...'}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              if (onTyping) onTyping();
            }}
            onKeyDown={handleKeyDown}
            disabled={!room}
            className="flex-1"
          />
          
          <div className="flex items-center">
            <AudioRecorder
              onAudioRecorded={handleSendAudio}
              isDisabled={!room}
            />
            
            {room && (
              <FileUploadButton
                roomId={room.id}
                onFileUploaded={(fileUrl, fileType) => handleSendFile(fileUrl)}
                isDisabled={!room}
              />
            )}
            
            <Button
              onClick={() => onSendMessage()}
              disabled={!messageText.trim() || !room}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
