
import React, { useState, useRef, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { AudioRecorder } from './AudioRecorder';
import { ChatThread } from './ChatThread';
import { FileUploadButton } from './file/FileUploadButton';
import { MessageSearch } from './search/MessageSearch';
import { useChatSearch } from '@/hooks/useChatSearch';

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
  onFlagMessage: (messageId: string, reason: string) => void;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  isTyping: boolean;
  typingUsers: Array<{id: string, name: string}>;
  threadMessages: ChatMessage[];
  activeThreadId: string | null;
  onOpenThread: (messageId: string) => void;
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
  threadMessages,
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewWorkOrderDetails,
  navigateToRoom,
  onNewChat
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Get the room status (online, away, etc.)
  const getRoomStatus = (room: ChatRoom) => {
    // This is a simplified implementation
    if (room.type === 'direct') {
      // For direct messages, could check if the other user is online
      return 'online';
    }
    return 'offline';
  };

  // Find a parent message for an active thread if it exists
  const findParentMessage = () => {
    if (!activeThreadId) return null;
    return messages.find(message => message.id === activeThreadId) || null;
  };

  // Get the parent message for the current thread
  const parentMessage = findParentMessage();

  // Initialize chat search
  const {
    isSearching,
    searchResults,
    searchActive,
    selectedMessageId,
    searchTerm,
    handleSearch,
    clearSearch,
    selectMessage
  } = useChatSearch({
    roomId: currentRoom?.id || null
  });

  // Scroll to selected message after search
  useEffect(() => {
    if (selectedMessageId) {
      const selectedMessageElement = document.getElementById(`message-${selectedMessageId}`);
      if (selectedMessageElement) {
        selectedMessageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectedMessageElement.classList.add('bg-yellow-100');
        setTimeout(() => {
          selectedMessageElement.classList.remove('bg-yellow-100');
        }, 2000);
      }
    }
  }, [selectedMessageId]);

  // Toggle search panel
  const toggleSearch = () => {
    if (showSearch) {
      clearSearch();
    }
    setShowSearch(!showSearch);
  };

  return (
    <div className="flex h-full">
      <ChatSidebar 
        rooms={chatRooms}
        currentRoom={currentRoom}
        onSelectRoom={onSelectRoom}
        onNewChat={onNewChat}
        userId={userId}
        getRoomStatus={getRoomStatus}
      />
      
      <div className="flex flex-col flex-1 h-full">
        <div className="flex flex-1 relative">
          <div className={`flex flex-col flex-1 overflow-hidden ${activeThreadId ? 'md:mr-72' : ''}`}>
            {showSearch && currentRoom && (
              <div className="p-3 border-b">
                <MessageSearch
                  onSearch={handleSearch}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  onClearSearch={clearSearch}
                  onSelectMessage={selectMessage}
                />
              </div>
            )}
            
            <ChatWindow
              room={currentRoom}
              messages={messages}
              userId={userId}
              newMessageText={newMessageText}
              setNewMessageText={setNewMessageText}
              onSendMessage={() => onSendMessage()}
              onPinRoom={onPinRoom}
              onArchiveRoom={onArchiveRoom}
              onFlagMessage={onFlagMessage}
              onEditMessage={onEditMessage}
              searchTerm={searchActive ? searchTerm : ''}
              isTyping={isTyping}
              typingUsers={typingUsers}
              onOpenThread={onOpenThread}
              toggleSearch={toggleSearch}
              searchActive={searchActive}
              onViewWorkOrderDetails={onViewWorkOrderDetails}
              contentRef={messageContainerRef}
            >
              <div className="flex items-center gap-2">
                <FileUploadButton
                  onFileSelected={(fileUrl) => onSendFileMessage(fileUrl)}
                  disabled={!currentRoom}
                />
                <AudioRecorder
                  onAudioRecorded={() => {}}
                  onRecordingComplete={(audioUrl) => onSendVoiceMessage(audioUrl)}
                  isDisabled={!currentRoom}
                />
              </div>
            </ChatWindow>
          </div>
          
          {activeThreadId && parentMessage && (
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-72 border-l">
              <ChatThread
                threadId={activeThreadId}
                messages={threadMessages}
                userId={userId}
                onClose={onCloseThread}
                onSendReply={(content, threadParentId) => onSendMessage(threadParentId)}
                parentMessage={parentMessage}
                onEditMessage={onEditMessage}
                onFlagMessage={onFlagMessage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
