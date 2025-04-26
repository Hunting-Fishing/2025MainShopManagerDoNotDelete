
import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MoreHorizontal, 
  Edit2, 
  Flag, 
  Reply, 
  Check, 
  X, 
  MessageSquare 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatFileMessage } from './file/ChatFileMessage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  userId: string;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onFlag?: (messageId: string, reason: string) => void;
  onReply?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  userId,
  onEdit,
  onFlag,
  onReply
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };
  
  const handleSaveEdit = async () => {
    if (editedContent.trim() !== message.content) {
      await onEdit(message.id, editedContent);
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleFlag = () => {
    if (onFlag) {
      onFlag(message.id, "Inappropriate content");
    }
  };
  
  const handleReply = () => {
    if (onReply) {
      onReply(message.id);
    }
  };
  
  const isFile = message.message_type && ['image', 'audio', 'video', 'file'].includes(message.message_type);
  
  // Format timestamp
  const timestamp = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isCurrentUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-200'
      }`}>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-medium">
            {isCurrentUser ? 'You' : message.sender_name}
          </span>
          <div className="flex items-center gap-2">
            {message.is_edited && (
              <span className="text-xs opacity-70">(edited)</span>
            )}
            {message.thread_count && message.thread_count > 0 && (
              <div 
                className="flex items-center gap-1 text-xs cursor-pointer" 
                onClick={handleReply}
              >
                <MessageSquare className="h-3 w-3" />
                <span>{message.thread_count}</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isCurrentUser && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onReply && (
                  <DropdownMenuItem onClick={handleReply}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                {!isCurrentUser && onFlag && (
                  <DropdownMenuItem onClick={handleFlag}>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
          
        {isEditing ? (
          <div className="mt-2">
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              autoFocus
              className="mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCancelEdit}
                className="h-7"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveEdit}
                className="h-7"
              >
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isFile ? (
              <ChatFileMessage message={message} />
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </>
        )}
        
        <div className="text-xs opacity-70 mt-1">{timestamp}</div>
      </div>
    </div>
  );
};
