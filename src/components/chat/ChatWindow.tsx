
import React, { useState, useRef, useEffect } from 'react';
import { ChatRoom, ChatMessage as ChatMessageType } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, FileUp, Mic, PinIcon, ArchiveIcon, Info } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatThread } from './ChatThread';
import { FileUploadButton } from './file/FileUploadButton';
import { AudioRecorder } from './AudioRecorder';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
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
  typingUsers?: { id: string, name: string }[];
  threadMessages?: { [key: string]: ChatMessageType[] };
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
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await onSendMessage(activeThreadId || undefined);
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleVoiceMessage = (audioUrl: string) => {
    if (onSendVoiceMessage) {
      onSendVoiceMessage(audioUrl, activeThreadId || undefined);
      setShowVoiceRecorder(false);
    }
  };

  const handleFileMessage = async (fileUrl: string) => {
    if (onSendFileMessage) {
      await onSendFileMessage(fileUrl, activeThreadId || undefined);
    }
  };

  if (!room) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-8">
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p>Select a conversation from the sidebar or start a new chat</p>
        </CardContent>
      </Card>
    );
  }

  // Determine if this is a work order chat
  const isWorkOrderChat = room.type === 'work_order' && room.work_order_id;
  const workOrderInfo = room.metadata?.work_order;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {isWorkOrderChat && workOrderInfo && (
              <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-800 border-indigo-200">
                Work Order
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {isWorkOrderChat && onViewInfo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onViewInfo}
                      className="h-8 w-8"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Work Order Details</p>
                  </TooltipContent>
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
                      className={`h-8 w-8 ${room.is_pinned ? "text-blue-600" : ""}`}
                    >
                      <PinIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{room.is_pinned ? "Unpin Conversation" : "Pin Conversation"}</p>
                  </TooltipContent>
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
                      className="h-8 w-8"
                    >
                      <ArchiveIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{room.is_archived ? "Restore Conversation" : "Archive Conversation"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        {isWorkOrderChat && workOrderInfo && (
          <div className="mt-1 text-sm text-muted-foreground">
            Status: <span className="font-medium">{workOrderInfo.status}</span> • 
            Customer: <span className="font-medium">{workOrderInfo.customer_name}</span>
            {workOrderInfo.vehicle && (
              <> • Vehicle: <span className="font-medium">{workOrderInfo.vehicle}</span></>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-auto p-0">
        {activeThreadId ? (
          <ChatThread
            threadId={activeThreadId}
            messages={threadMessages?.[activeThreadId] || []}
            userId={userId}
            userName={userName}
            messageText={messageText}
            setMessageText={setMessageText}
            onSendMessage={() => onSendMessage(activeThreadId)}
            onCloseThread={onCloseThread}
            onEditMessage={onEditMessage}
            onSendVoiceMessage={onSendVoiceMessage ? 
              (audioUrl: string) => onSendVoiceMessage(audioUrl, activeThreadId) : undefined}
            onSendFileMessage={onSendFileMessage ?
              (fileUrl: string) => onSendFileMessage(fileUrl, activeThreadId) : undefined}
          />
        ) : (
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isCurrentUser={message.sender_id === userId}
                  userId={userId}
                  onEdit={onEditMessage || (async () => {})}
                  onFlag={onFlagMessage}
                  onReply={onOpenThread}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            {isTyping && typingUsers && typingUsers.length > 0 && (
              <div className="text-sm text-slate-500 italic">
                {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t flex flex-col">
        {showVoiceRecorder ? (
          <div className="mb-2">
            <AudioRecorder onRecord={handleVoiceMessage} onCancel={() => setShowVoiceRecorder(false)} />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              ref={messageInputRef}
              placeholder="Type a message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-grow"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowVoiceRecorder(true)}>
                    <Mic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record Voice Message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onSendFileMessage && (
              <FileUploadButton onFileUpload={handleFileMessage}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <FileUp className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload File</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FileUploadButton>
            )}
            
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
