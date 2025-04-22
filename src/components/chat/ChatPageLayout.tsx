
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage as MessageComponent } from './ChatMessage';
import { ChatThread } from './ChatThread';
import { AudioRecorder } from './AudioRecorder';
import { FileUploadButton } from './file/FileUploadButton';
import { ChatRoom, ChatMessage, ChatParticipant } from '@/types/chat';
import { useChatSearch } from '@/hooks/useChatSearch';
import { MessageSearch } from './search/MessageSearch';
import { OnlineStatusIndicator } from './dialog/OnlineStatusIndicator';
import { TypingIndicator } from './dialog/TypingIndicator';
import { StatusBadge } from './dialog/StatusBadge';

interface TypingUser {
  id: string;
  name: string;
}

interface ChatPageLayoutProps {
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  userName: string;
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSelectRoom: (room: ChatRoom) => void;
  onSendMessage: (threadParentId?: string) => Promise<void>;
  onSendVoiceMessage: (audioUrl: string, threadParentId?: string) => Promise<void>;
  onSendFileMessage: (fileUrl: string, threadParentId?: string) => Promise<void>;
  onPinRoom: () => void;
  onArchiveRoom: () => void;
  onFlagMessage: (messageId: string, isFlagged: boolean) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  isTyping: boolean;
  typingUsers: TypingUser[];
  onTyping?: () => void;
  threadMessages: Record<string, ChatMessage[]>;
  activeThreadId: string | null;
  onOpenThread: (parentMessageId: string) => void;
  onCloseThread: () => void;
  onViewWorkOrderDetails?: () => void;
  navigateToRoom: (roomId: string) => void;
  onNewChat: () => void;
}

export const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({
  chatRooms,
  currentRoom,
  messages,
  userId,
  userName,
  newMessageText,
  setNewMessageText,
  onSelectRoom,
  onSendMessage,
  onSendVoiceMessage,
  onSendFileMessage,
  onPinRoom,
  onArchiveRoom,
  onFlagMessage,
  onEditMessage,
  isTyping,
  typingUsers,
  onTyping,
  threadMessages,
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewWorkOrderDetails,
  navigateToRoom,
  onNewChat
}) => {
  const [activeTab, setActiveTab] = useState<string>('messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Setup search functionality
  const {
    isSearching,
    searchResults,
    searchActive,
    selectedMessageId,
    handleSearch,
    clearSearch,
    selectMessage
  } = useChatSearch({ roomId: currentRoom?.id || null });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!searchActive && !activeThreadId) {
      scrollToBottom();
    }
  }, [messages, activeThreadId, searchActive]);

  useEffect(() => {
    if (selectedMessageId) {
      const element = document.getElementById(`message-${selectedMessageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/20');
        setTimeout(() => {
          element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/20');
        }, 3000);
      }
    }
  }, [selectedMessageId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessageText(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const getRoomStatus = (room: ChatRoom): 'online' | 'away' | 'do_not_disturb' | 'offline' => {
    if (!room.participants || room.participants.length === 0) return 'offline';
    
    // If it's a direct message, check if the other person is online
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p.user_id !== userId);
      return otherParticipant?.is_online ? 'online' : 'offline';
    }
    
    // For group chats, if any participant is online, show as online
    const onlineParticipants = room.participants.filter(p => p.is_online && p.user_id !== userId);
    if (onlineParticipants.length > 0) return 'online';
    
    return 'offline';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ChatSidebar
        rooms={chatRooms}
        currentRoom={currentRoom}
        onSelectRoom={onSelectRoom}
        onNewChat={onNewChat}
        userId={userId}
        getRoomStatus={getRoomStatus}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Chat Header */}
        {currentRoom ? (
          <div className="border-b px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {currentRoom.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <OnlineStatusIndicator 
                  status={getRoomStatus(currentRoom)}
                  className="absolute -bottom-1 -right-1 border-2 border-white dark:border-gray-800"
                  withPing={true}
                />
              </div>
              <div>
                <h2 className="font-medium">{currentRoom.name}</h2>
                {currentRoom.type === 'work_order' && (
                  <StatusBadge 
                    status="info"
                    text={`Work Order: ${currentRoom.metadata?.work_order?.number || ''}`}
                    size="sm"
                  />
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Tabs defaultValue="messages" className="w-[300px]" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="border-b px-4 py-4 bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="font-medium">Select a conversation</h2>
          </div>
        )}

        {/* Chat Content */}
        {currentRoom ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="messages" className="flex-1 flex flex-col overflow-hidden" value={activeTab}>
                <TabsContent value="messages" className="flex-1 flex flex-col overflow-hidden mt-0">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        id={`message-${message.id}`}
                        className="transition-colors duration-500"
                      >
                        <MessageComponent
                          message={message}
                          isCurrentUser={message.sender_id === userId}
                          onReply={() => onOpenThread(message.id)}
                          onFlag={(isFlagged) => onFlagMessage(message.id, isFlagged)}
                          onEdit={(newContent) => onEditMessage(message.id, newContent)}
                          replyCount={message.thread_count || 0}
                          showThread={activeThreadId === message.id}
                        />
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="px-4 py-2">
                      <TypingIndicator typingUsers={typingUsers} />
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="p-3 border-t bg-white dark:bg-gray-800">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          ref={inputRef}
                          type="text"
                          placeholder="Type a message..."
                          value={newMessageText}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyPress}
                          className="pr-10"
                        />
                        <FileUploadButton
                          roomId={currentRoom.id}
                          onFileUploaded={(fileUrl, fileType) => onSendFileMessage(fileUrl)}
                        />
                      </div>
                      <AudioRecorder onAudioReady={(audioUrl) => onSendVoiceMessage(audioUrl)} />
                      <Button onClick={() => onSendMessage()}>Send</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="search" className="flex-1 flex flex-col overflow-hidden mt-0 p-4">
                  <MessageSearch
                    onSearch={handleSearch}
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onClearSearch={clearSearch}
                    onSelectMessage={selectMessage}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Thread Panel */}
            {activeThreadId && (
              <div className="w-80 border-l flex flex-col bg-white dark:bg-gray-800">
                <ChatThread
                  parentMessage={messages.find(m => m.id === activeThreadId)}
                  messages={threadMessages[activeThreadId] || []}
                  currentUserId={userId}
                  onClose={onCloseThread}
                  onSendMessage={(text) => onSendMessage(activeThreadId)}
                  newMessageText={newMessageText}
                  setNewMessageText={setNewMessageText}
                  onSendVoiceMessage={(audioUrl) => onSendVoiceMessage(audioUrl, activeThreadId)}
                  onSendFileMessage={(fileUrl) => onSendFileMessage(fileUrl, activeThreadId)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
              <h3 className="text-lg font-medium mb-2">Welcome to Chat</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select a conversation or start a new one</p>
              <Button onClick={onNewChat}>Start New Chat</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
