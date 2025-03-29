
import React, { useRef, useEffect } from 'react';
import { ChatRoom, ChatMessage as ChatMessageType } from '@/types/chat';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Info, Users } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessageType[];
  userId: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onViewInfo?: () => void;
  onViewParticipants?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  userId,
  messageText,
  setMessageText,
  onSendMessage,
  onViewInfo,
  onViewParticipants
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!room) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="text-center p-6">
          <div className="bg-slate-100 rounded-full p-6 inline-block mx-auto mb-4">
            <Send className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-slate-500 text-sm max-w-md">
            Choose an existing conversation from the sidebar or start a new one to begin messaging.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{room.name}</CardTitle>
        <div className="flex items-center space-x-2">
          {room.type === 'work_order' && onViewInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onViewInfo}>
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View work order details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onViewParticipants && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onViewParticipants}>
                    <Users className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View participants</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === userId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 px-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow"
          />
          <Button 
            onClick={onSendMessage} 
            disabled={!messageText.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
