
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, Pin, Archive } from "lucide-react";
import { ChatRoom } from "@/types/chat";

interface ChatHeaderProps {
  room: ChatRoom;
  onPinRoom: () => void;
  onArchiveRoom: () => void;
  toggleSearch?: () => void;
  searchActive?: boolean;
  onViewWorkOrderDetails?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  onPinRoom,
  onArchiveRoom,
  toggleSearch,
  searchActive,
  onViewWorkOrderDetails,
}) => (
  <div className="p-3 border-b bg-white flex justify-between items-center">
    <div>
      <h1 className="font-medium text-lg">{room.name}</h1>
      {room.type === "work_order" && (
        <p className="text-xs text-slate-500">
          Work Order #{room.work_order_id}
          {onViewWorkOrderDetails && (
            <Button
              variant="link"
              size="sm"
              className="p-0 ml-1 h-auto text-xs"
              onClick={onViewWorkOrderDetails}
            >
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
);
