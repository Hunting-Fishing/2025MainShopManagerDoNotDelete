
import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Edit, Flag, MessageSquare, CheckCircle } from 'lucide-react';
import { prepareHighlightedText } from '@/services/chat/search';
import { ChatFileMessage } from './ChatFileMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  userId: string;
  onEdit: (newContent: string) => void;
  onFlag: (isFlagged: boolean) => void;
  onOpenThread?: () => void;
  searchTerm?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  userId,
  onEdit,
  onFlag,
  onOpenThread,
  searchTerm = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isFlagged, setIsFlagged] = useState(message.is_flagged);
  
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

  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-2`}>
      <div className="flex items-center mb-1">
        <span className="text-xs text-slate-500 mr-2">{message.sender_name}</span>
        <span className="text-xs text-slate-400">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className={`max-w-3/4 ${isCurrentUser ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'} p-3 rounded-lg shadow-sm`}>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};
