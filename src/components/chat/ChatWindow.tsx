
import React, { useState } from "react";
import { ChatRoom, ChatMessage as ChatMessageType } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { ChatMessagesList } from "./ChatMessagesList";
import { ChatInputArea } from "./ChatInputArea";
import { ChatCustomerPanel } from "./customer/ChatCustomerPanel";
import { useChatCustomerData } from "@/hooks/useChatCustomerData";

interface TypingUser {
  id: string;
  name: string;
}

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
  typingUsers: TypingUser[];
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
  searchTerm = "",
  isTyping = false,
  typingUsers = [],
  onOpenThread,
  toggleSearch,
  searchActive = false,
  onViewWorkOrderDetails,
  contentRef,
  children,
}) => {
  // Get customerId from room metadata if available
  const customerId = room?.metadata?.work_order?.customer_id || 
    room?.metadata?.customer_id || 
    (room?.type === 'direct' && room?.metadata?.is_customer_chat) ? 
      room?.participants?.find(p => p.role === 'customer')?.user_id : null;
  
  // Use custom hook to fetch customer data
  const { customer, vehicles, workOrders } = useChatCustomerData({ customerId });
  
  // State to control customer panel visibility
  const [showCustomerPanel, setShowCustomerPanel] = useState(!!customerId);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {room && (
        <ChatHeader
          room={room}
          onPinRoom={onPinRoom}
          onArchiveRoom={onArchiveRoom}
          toggleSearch={toggleSearch}
          searchActive={searchActive}
          onViewWorkOrderDetails={onViewWorkOrderDetails}
          showCustomerPanel={showCustomerPanel}
          setShowCustomerPanel={setShowCustomerPanel}
          hasCustomer={!!customerId}
        />
      )}
      <div className="flex-1 flex overflow-hidden">
        <ChatMessagesList
          room={room}
          messages={messages}
          userId={userId}
          isTyping={isTyping}
          typingUsers={typingUsers}
          searchTerm={searchTerm}
          onEditMessage={onEditMessage}
          onFlagMessage={onFlagMessage}
          onOpenThread={onOpenThread}
          contentRef={contentRef}
          customerId={customerId}
        />
        
        {showCustomerPanel && customerId && (
          <ChatCustomerPanel 
            customer={customer} 
            vehicles={vehicles}
            workOrders={workOrders}
          />
        )}
      </div>
      <ChatInputArea
        newMessageText={newMessageText}
        setNewMessageText={setNewMessageText}
        onSendMessage={onSendMessage}
        disabled={!room}
        roomId={room?.id}
      >
        {children}
      </ChatInputArea>
    </div>
  );
};
