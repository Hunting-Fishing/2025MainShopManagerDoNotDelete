
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { parseFileFromMessage } from '@/services/chat/fileService';
import { ChatFileMessage } from './file/ChatFileMessage';
import { cn } from "@/lib/utils";
import { TaggedItem } from './TaggedItem';
import { parseTaggedItems } from '@/services/chat/message/types';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';
import { saveMessageToRecord } from '@/services/chat/message/mutations';
import { toast } from '@/hooks/use-toast';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
  onFlagMessage?: (messageId: string, reason: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isCurrentUser,
  onFlagMessage 
}) => {
  // Parse the message content for file references
  const { fileInfo, text } = parseFileFromMessage(message.content);
  
  // Parse tagged items
  const taggedItems = parseTaggedItems(message.content);
  
  // Format time
  const formattedTime = formatMessageTime(message.created_at);
  
  // Check if this message has been saved already
  const isSavedToWorkOrder = message.metadata?.saved_to?.work_order;
  const isSavedToVehicle = message.metadata?.saved_to?.vehicle;
  
  // Handle saving to work order
  const handleSaveToWorkOrder = async () => {
    try {
      if (!message.metadata?.taggedItems?.workOrderIds?.length) {
        toast({
          title: "No work order tagged",
          description: "This message doesn't have a work order tag (#WO-123)",
          variant: "destructive"
        });
        return;
      }
      
      // Get the first tagged work order
      const workOrderId = message.metadata.taggedItems.workOrderIds[0];
      
      await saveMessageToRecord(message.id, 'work_order', workOrderId);
      
      toast({
        title: "Saved to work order",
        description: `Message saved to work order #${workOrderId}`,
      });
    } catch (error) {
      console.error("Error saving to work order:", error);
      toast({
        title: "Error",
        description: "Failed to save message to work order",
        variant: "destructive"
      });
    }
  };
  
  // Handle saving to vehicle history
  const handleSaveToVehicleHistory = async () => {
    try {
      // For simplicity, using the work order's vehicle if available
      // In a real app, you might want to prompt the user to select a vehicle
      if (!message.metadata?.taggedItems?.workOrderIds?.length) {
        toast({
          title: "No work order tagged",
          description: "Please tag a work order with a vehicle first",
          variant: "destructive"
        });
        return;
      }
      
      // In a real implementation, you would get the vehicle ID from the work order
      // This is a placeholder example
      const workOrderId = message.metadata.taggedItems.workOrderIds[0];
      const vehicleId = "placeholder-vehicle-id";
      
      await saveMessageToRecord(message.id, 'vehicle', vehicleId);
      
      toast({
        title: "Saved to vehicle history",
        description: "Message saved to vehicle history record",
      });
    } catch (error) {
      console.error("Error saving to vehicle history:", error);
      toast({
        title: "Error",
        description: "Failed to save message to vehicle history",
        variant: "destructive"
      });
    }
  };
  
  // Handle flagging message
  const handleFlagMessage = () => {
    if (onFlagMessage) {
      onFlagMessage(message.id, "needs_attention");
    }
  };
  
  return (
    <div className={cn(
      "flex mb-2",
      isCurrentUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {!isCurrentUser && (
          <div className="ml-2 text-xs text-slate-500 mb-1">
            {message.sender_name}
          </div>
        )}
        
        <div className={cn(
          "rounded-lg px-3 py-2 break-words",
          isCurrentUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-slate-200 text-slate-900"
        )}>
          {/* If it's a file message, render the appropriate component */}
          {fileInfo ? (
            <ChatFileMessage fileInfo={fileInfo} caption={text} />
          ) : (
            <div>
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              
              {/* Render tagged items if there are any */}
              {(taggedItems.workOrderIds.length > 0 || 
                taggedItems.partIds.length > 0 || 
                taggedItems.warrantyIds.length > 0 || 
                taggedItems.jobIds.length > 0) && (
                <div className="mt-1 flex flex-wrap">
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
              
              {/* Show message action buttons */}
              {!isCurrentUser && (
                <div className="mt-2 flex gap-1 justify-end">
                  <Button 
                    variant="outline"
                    size="xs"
                    className="text-xs h-6 px-2 py-0 bg-white"
                    onClick={handleSaveToWorkOrder}
                    disabled={isSavedToWorkOrder}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Work Order
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="xs"
                    className="text-xs h-6 px-2 py-0 bg-white"
                    onClick={handleSaveToVehicleHistory}
                    disabled={isSavedToVehicle}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Vehicle
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="xs"
                    className="text-xs h-6 px-2 py-0 bg-white"
                    onClick={handleFlagMessage}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Flag
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-slate-500 mt-1",
          isCurrentUser ? "text-right mr-1" : "ml-1"
        )}>
          {formattedTime}
          {message.is_flagged && (
            <span className="ml-2 text-amber-600">
              ⚠️ {message.flag_reason || 'Flagged'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format message time
const formatMessageTime = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // If the message is from today, just display the time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise, show a relative time
  return formatDistanceToNow(messageDate, { addSuffix: true });
};
