
import React from 'react';
import { ChatRoom } from '@/types/chat';
import { format } from 'date-fns';
import { MessageSquare, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ShiftChatIndicatorProps {
  date: Date;
  chatRooms?: ChatRoom[];
  onClick?: (room: ChatRoom) => void;
}

export const ShiftChatIndicator: React.FC<ShiftChatIndicatorProps> = ({
  date,
  chatRooms = [],
  onClick
}) => {
  // Filter shift chats for this date
  const shiftChats = chatRooms.filter(room => {
    if (!room.metadata?.is_shift_chat || !room.metadata?.shift_date) return false;
    
    // Format date to 'yyyy-MM-dd' for comparison
    const chatDate = room.metadata.shift_date;
    const currentDate = format(date, 'yyyy-MM-dd');
    
    return chatDate === currentDate;
  });
  
  if (shiftChats.length === 0) return null;
  
  return (
    <div className="absolute bottom-1 right-1 z-20">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1 cursor-pointer hover:bg-slate-200",
                shiftChats.length > 0 && "bg-blue-100 hover:bg-blue-200 text-blue-800"
              )}
              onClick={() => onClick && shiftChats.length === 1 && onClick(shiftChats[0])}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{shiftChats.length}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 p-1">
              <div className="text-xs font-medium">Shift Chats:</div>
              {shiftChats.map(chat => (
                <div 
                  key={chat.id} 
                  className="text-xs cursor-pointer hover:bg-slate-100 p-1 rounded flex items-center gap-1"
                  onClick={() => onClick && onClick(chat)}
                >
                  <Users className="h-3 w-3" />
                  <span>{chat.name || chat.metadata?.shift_name || 'Unnamed shift'}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
