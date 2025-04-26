
import React from "react";
import { ChatRoom } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Pin, Archive, Search, FileText, User, X } from "lucide-react";

interface ChatHeaderProps {
  room: ChatRoom;
  onPinRoom: () => void;
  onArchiveRoom: () => void;
  toggleSearch?: () => void;
  searchActive?: boolean;
  onViewWorkOrderDetails?: () => void;
  showCustomerPanel?: boolean;
  setShowCustomerPanel?: (show: boolean) => void;
  hasCustomer?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  onPinRoom,
  onArchiveRoom,
  toggleSearch,
  searchActive,
  onViewWorkOrderDetails,
  showCustomerPanel = false,
  setShowCustomerPanel,
  hasCustomer = false
}) => {
  const isWorkOrderChat = !!room.metadata?.work_order;
  const isCustomerChat = !!room.metadata?.is_customer_chat;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-900">
      <div className="flex items-center">
        <h3 className="font-medium text-lg">{room.name}</h3>
        {room.is_pinned && (
          <Pin className="h-4 w-4 text-blue-500 ml-2 fill-blue-500" />
        )}
      </div>
      <div className="flex items-center space-x-2">
        {toggleSearch && (
          <Button
            variant={searchActive ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleSearch}
            title="Search messages"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        {hasCustomer && setShowCustomerPanel && (
          <Button
            variant={showCustomerPanel ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowCustomerPanel(!showCustomerPanel)}
            title={showCustomerPanel ? "Hide customer details" : "Show customer details"}
          >
            {showCustomerPanel ? (
              <X className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
        )}

        {isWorkOrderChat && onViewWorkOrderDetails && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewWorkOrderDetails}
            title="View work order details"
          >
            <FileText className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onPinRoom}
          title={room.is_pinned ? "Unpin chat" : "Pin chat"}
        >
          <Pin className={`h-4 w-4 ${room.is_pinned ? "fill-blue-500 text-blue-500" : ""}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onArchiveRoom}
          title="Archive chat"
        >
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
