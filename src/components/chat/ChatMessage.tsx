
import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Edit, Flag, MessageSquare, CheckCircle, CalendarDays } from 'lucide-react';
import { prepareHighlightedText } from '@/services/chat/search';
import { ChatFileMessage } from './ChatFileMessage';
import { MessageBubble } from './message/MessageBubble';
import { ChatReminderButton } from './reminder/ChatReminderButton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { TaggedItem } from './TaggedItem';
import { useChatReminders } from '@/hooks/useChatReminders';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  userId: string;
  onEdit: (newContent: string) => void;
  onFlag: (isFlagged: boolean) => void;
  onOpenThread?: () => void;
  searchTerm?: string;
  customerId?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  userId,
  onEdit,
  onFlag,
  onOpenThread,
  searchTerm = '',
  customerId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isFlagged, setIsFlagged] = useState(message.is_flagged);
  
  const { createReminderFromMessage } = useChatReminders(customerId);
  
  // Check if message has a reminder attached
  const hasReminder = message.metadata?.reminder_id;
  const reminderDueDate = message.metadata?.reminder_due_date 
    ? new Date(message.metadata.reminder_due_date) 
    : null;
  const reminderPriority = message.metadata?.reminder_priority || 'medium';
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };
  
  const saveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };
  
  const toggleFlag = () => {
    const newFlagged = !isFlagged;
    setIsFlagged(newFlagged);
    onFlag(newFlagged);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleCreateReminder = async (reminderData: any) => {
    if (!customerId) return;
    await createReminderFromMessage(reminderData);
  };

  // Priority to color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle file messages
  if (message.file_url) {
    return <ChatFileMessage message={message} isCurrentUser={isCurrentUser} />;
  }

  // Render highlighted content when search term is present
  const renderMessageContent = () => {
    if (!searchTerm) {
      return message.content;
    }
    
    // Use the utility function to prepare segments for highlighting
    const segments = prepareHighlightedText(message.content, searchTerm);
    
    return segments.map((segment, index) => (
      segment.highlight ? 
        <span key={index} className="bg-yellow-200 dark:bg-yellow-700">{segment.text}</span> : 
        <span key={index}>{segment.text}</span>
    ));
  };

  // Extract work order, part, warranty IDs from message metadata if present
  const taggedItems = message.metadata?.taggedItems || {};
  
  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-2`}>
      <div className="flex items-center mb-1">
        <span className="text-xs text-slate-500 mr-2">{message.sender_name}</span>
        <span className="text-xs text-slate-400">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <MessageBubble isCurrentUser={isCurrentUser}>
        {hasReminder && (
          <div className="mb-1">
            <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(reminderPriority)}`}>
              <CalendarDays className="h-3 w-3 mr-1" />
              Reminder: {reminderDueDate ? format(reminderDueDate, 'MMM d, yyyy') : 'N/A'}
            </Badge>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-esm-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button size="sm" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words">{renderMessageContent()}</p>
            
            {message.is_edited && !isEditing && (
              <span className="text-xs text-slate-400 mt-1 italic block">(edited)</span>
            )}
            
            {/* Tagged Items Display */}
            {taggedItems && Object.keys(taggedItems).length > 0 && (
              <div className="mt-2 flex flex-wrap">
                {taggedItems.workOrderIds?.map((id: string) => (
                  <TaggedItem key={`wo-${id}`} type="work-order" id={id} />
                ))}
                {taggedItems.partIds?.map((id: string) => (
                  <TaggedItem key={`part-${id}`} type="part" id={id} />
                ))}
                {taggedItems.warrantyIds?.map((id: string) => (
                  <TaggedItem key={`warranty-${id}`} type="warranty" id={id} />
                ))}
              </div>
            )}
            
            <div className="flex mt-2 justify-end items-center gap-1">
              {message.thread_count > 0 && (
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={onOpenThread}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-xs ml-1">{message.thread_count}</span>
                </Button>
              )}
              
              {onOpenThread && (
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={onOpenThread}
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              )}
              
              {isCurrentUser && (
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleEdit}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost" 
                size="icon"
                className={`h-6 w-6 ${isFlagged ? 'text-red-500' : ''}`}
                onClick={toggleFlag}
              >
                <Flag className="h-3 w-3" />
              </Button>
              
              <ChatReminderButton 
                messageId={message.id}
                messageContent={message.content}
                onCreateReminder={handleCreateReminder}
              />
            </div>
          </>
        )}
      </MessageBubble>
    </div>
  );
};
