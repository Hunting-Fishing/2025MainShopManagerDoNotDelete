
// Let's just update the import to remove saveMessageToRecord since it doesn't fit in our current scope
import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Flag,
  Edit,
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TaggedItem } from './TaggedItem';
import { ChatFileMessage } from './file/ChatFileMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  onFlag?: (messageId: string, reason: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onOpenThread?: (messageId: string) => void;
  userId: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  onFlag,
  onEdit,
  onOpenThread,
  userId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  
  // Format time
  const formattedTime = format(new Date(message.created_at), 'h:mm a');
  
  // Handle flagging a message
  const handleFlagMessage = () => {
    if (onFlag) {
      const reason = prompt("Please provide a reason for flagging this message:", "");
      if (reason) {
        onFlag(message.id, reason);
      }
    }
  };
  
  // Handle editing a message
  const handleEditClick = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Check if this message has tagged items
  const hasTaggedItems = message.metadata?.taggedItems && (
    message.metadata.taggedItems.workOrderIds?.length > 0 ||
    message.metadata.taggedItems.partIds?.length > 0 ||
    message.metadata.taggedItems.warrantyIds?.length > 0 ||
    message.metadata.taggedItems.jobIds?.length > 0
  );
  
  // Detect if file message
  const isFileMessage = message.message_type === 'file' || message.message_type === 'audio' || message.file_url;
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3 shadow`}>
        {/* Message header */}
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="font-semibold text-sm">{message.sender_name}</span>
            <span className={`text-xs ml-2 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {formattedTime}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 ${isCurrentUser ? 'text-white' : 'text-gray-500'}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {message.sender_id === userId && (
                <>
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {onOpenThread && (
                <DropdownMenuItem onClick={() => onOpenThread(message.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply in Thread
                </DropdownMenuItem>
              )}
              
              {onFlag && (
                <DropdownMenuItem onClick={handleFlagMessage}>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag Message
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Message content */}
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded text-black resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-7 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="h-7 px-2"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {isFileMessage ? (
              <ChatFileMessage message={message} />
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            
            {/* Thread count */}
            {message.thread_count && message.thread_count > 0 && onOpenThread && (
              <div 
                className={`mt-2 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-blue-500'} cursor-pointer`}
                onClick={() => onOpenThread(message.id)}
              >
                <MessageSquare className="h-3 w-3 inline-block mr-1" />
                {message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}
              </div>
            )}
          </div>
        )}
        
        {/* Tagged items */}
        {hasTaggedItems && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.metadata?.taggedItems?.workOrderIds?.map(id => (
              <TaggedItem key={`wo-${id}`} type="work-order" id={id} />
            ))}
            {message.metadata?.taggedItems?.partIds?.map(id => (
              <TaggedItem key={`part-${id}`} type="part" id={id} />
            ))}
            {message.metadata?.taggedItems?.warrantyIds?.map(id => (
              <TaggedItem key={`warranty-${id}`} type="warranty" id={id} />
            ))}
            {message.metadata?.taggedItems?.jobIds?.map(id => (
              <TaggedItem key={`job-${id}`} type="job" id={id} />
            ))}
          </div>
        )}
        
        {/* Edited indicator */}
        {message.is_edited && (
          <div className={`mt-1 text-xs italic ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
            Edited
          </div>
        )}
        
        {/* Flag indicator */}
        {message.is_flagged && (
          <div className="flex items-center mt-1">
            <Flag className="h-3 w-3 text-red-500 mr-1" />
            <span className="text-xs text-red-500">Flagged: {message.flag_reason}</span>
          </div>
        )}
      </div>
    </div>
  );
};
