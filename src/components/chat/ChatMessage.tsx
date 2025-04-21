
import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { MoreVertical, Flag, Reply, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChatFileMessage } from './file/ChatFileMessage';
import { parseFileFromMessage } from '@/services/chat/fileService';
import { parseTaggedItems } from '@/services/chat/message/messageHelpers';
import { TaggedItem } from './TaggedItem';
import { saveMessageToRecord } from '@/services/chat/message/mutations';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => Promise<void>;
  userId: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  onFlagMessage,
  onReply,
  onEdit,
  userId
}) => {
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('inappropriate');
  const [showEditInput, setShowEditInput] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [isEditing, setIsEditing] = useState(false);

  // Format relative time (e.g., "2 hours ago")
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  // Handle message flag submission
  const handleFlagSubmit = () => {
    if (onFlagMessage) {
      onFlagMessage(message.id, flagReason);
      setShowFlagDialog(false);
    }
  };
  
  // Handle message edit
  const handleEditSubmit = async () => {
    if (!editText.trim() || !onEdit) return;
    
    setIsEditing(true);
    try {
      await onEdit(message.id, editText);
      setShowEditInput(false);
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsEditing(false);
    }
  };
  
  // Parse any tagged items in message
  const taggedItems = parseTaggedItems(message.content);

  // Check if message is a file
  const fileInfo = message.message_type === 'file' || 
                  message.message_type === 'image' || 
                  message.message_type === 'video' || 
                  message.message_type === 'audio' 
                    ? parseFileFromMessage(message.content) 
                    : null;
  
  // Save message to a record (work order, vehicle, etc.)
  const handleSaveToRecord = async (recordType: 'work_order' | 'vehicle', recordId: string) => {
    try {
      await saveMessageToRecord(message.id, recordType, recordId);
    } catch (error) {
      console.error('Error saving message to record:', error);
    }
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div className={`rounded-lg p-3 ${
          isCurrentUser 
            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        }`}>
          {/* Sender name */}
          {!isCurrentUser && (
            <div className={`text-xs font-medium mb-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>
              {message.sender_name}
            </div>
          )}
          
          {/* Edit message input */}
          {showEditInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-1 border rounded-md text-black dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowEditInput(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleEditSubmit}
                  disabled={isEditing}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* File message */}
              {fileInfo ? (
                <ChatFileMessage message={message} />
              ) : (
                /* Text message content */
                <div>{message.content}</div>
              )}
            </>
          )}
          
          {/* Show edit indicator */}
          {message.is_edited && !showEditInput && (
            <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
              (edited)
            </div>
          )}
        </div>
        
        {/* Tagged items */}
        {(taggedItems.workOrderIds.length > 0 || 
          taggedItems.partIds.length > 0 || 
          taggedItems.warrantyIds.length > 0 ||
          taggedItems.jobIds.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {taggedItems.workOrderIds.map(id => (
              <TaggedItem key={`wo-${id}`} type="work-order" id={id} />
            ))}
            {taggedItems.partIds.map(id => (
              <TaggedItem key={`part-${id}`} type="part" id={id} />
            ))}
            {taggedItems.warrantyIds.map(id => (
              <TaggedItem key={`warranty-${id}`} type="warranty" id={id} />
            ))}
            {taggedItems.jobIds.map(id => (
              <TaggedItem key={`job-${id}`} type="job" id={id} />
            ))}
          </div>
        )}
        
        {/* Message info and actions */}
        <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
          <span>{formattedTime}</span>
          
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
              {onReply && (
                <DropdownMenuItem onClick={() => onReply(message.id)}>
                  <Reply className="h-3 w-3 mr-2" />
                  Reply
                </DropdownMenuItem>
              )}
              
              {isCurrentUser && onEdit && (
                <DropdownMenuItem onClick={() => setShowEditInput(true)}>
                  <Pencil className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {onFlagMessage && !isCurrentUser && (
                <DropdownMenuItem onClick={() => setShowFlagDialog(true)}>
                  <Flag className="h-3 w-3 mr-2" />
                  Flag Message
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Inappropriate Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">
              Please select a reason for flagging this message:
            </p>
            <RadioGroup value={flagReason} onValueChange={setFlagReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" />
                <Label htmlFor="inappropriate">Inappropriate content</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harmful" id="harmful" />
                <Label htmlFor="harmful">Harmful or abusive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam">Spam or misleading</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other reason</Label>
              </div>
            </RadioGroup>
            
            {flagReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="flag-details">Additional details</Label>
                <Textarea
                  id="flag-details"
                  placeholder="Please provide more information..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button onClick={handleFlagSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
