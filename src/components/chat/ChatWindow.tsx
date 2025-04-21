
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, MessageSquare, Pin, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatThread } from './ChatThread';
import { FileUploadButton } from './file/FileUploadButton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatWindowProps {
  room: ChatRoom | null;
  messages: ChatMessage[];
  userId: string;
  userName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (threadParentId?: string) => Promise<void>;
  onSendVoiceMessage?: (audioUrl: string, threadParentId?: string) => void;
  onSendFileMessage?: (fileUrl: string, threadParentId?: string) => Promise<void>;
  onPinRoom?: () => void;
  onArchiveRoom?: () => void;
  onFlagMessage?: (messageId: string, reason: string) => void;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  isTyping?: boolean;
  typingUsers?: {id: string, name: string}[];
  threadMessages?: {[key: string]: ChatMessage[]};
  activeThreadId?: string | null;
  onOpenThread?: (messageId: string) => void;
  onCloseThread?: () => void;
  onViewInfo?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  userId,
  userName,
  messageText,
  setMessageText,
  onSendMessage,
  onSendVoiceMessage,
  onSendFileMessage,
  onPinRoom,
  onArchiveRoom,
  onFlagMessage,
  onEditMessage,
  isTyping,
  typingUsers,
  threadMessages,
  activeThreadId,
  onOpenThread,
  onCloseThread,
  onViewInfo
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mentionDropdownOpen, setMentionDropdownOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Mock data for mentions - in a real app this would be fetched
  const mentionOptions = {
    users: [
      { id: 'user_1', name: 'John Smith', type: 'user' },
      { id: 'user_2', name: 'Sarah Johnson', type: 'user' },
      { id: 'user_3', name: 'Mike Thompson', type: 'user' },
    ],
    workOrders: [
      { id: 'wo_1', name: 'Oil Change #1234', type: 'work_order' },
      { id: 'wo_2', name: 'Brake Repair #5678', type: 'work_order' },
      { id: 'wo_3', name: 'Tire Rotation #9012', type: 'work_order' },
    ],
    parts: [
      { id: 'part_1', name: 'Oil Filter', type: 'part' },
      { id: 'part_2', name: 'Brake Pads', type: 'part' },
      { id: 'part_3', name: 'Air Filter', type: 'part' },
    ]
  };
  
  // Filtered options based on the current mention query
  const [filteredMentions, setFilteredMentions] = useState<{
    users: Array<{id: string, name: string, type: string}>,
    workOrders: Array<{id: string, name: string, type: string}>,
    parts: Array<{id: string, name: string, type: string}>
  }>(mentionOptions);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If pressing Enter without Shift, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
    // Handle mention key triggers
    else if (e.key === '@') {
      const position = textareaRef.current?.selectionStart || 0;
      setCursorPosition(position);
      setMentionQuery("");
      setMentionDropdownOpen(true);
    }
    // Handle Escape key to close mention dropdown
    else if (e.key === 'Escape' && mentionDropdownOpen) {
      setMentionDropdownOpen(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setMessageText(newText);
    
    // Check for mention character and update filtering
    if (mentionDropdownOpen) {
      const position = textareaRef.current?.selectionStart || 0;
      const textBeforeCursor = newText.substring(0, position);
      const mentionStart = textBeforeCursor.lastIndexOf('@');
      
      if (mentionStart !== -1) {
        const query = textBeforeCursor.substring(mentionStart + 1).trim().toLowerCase();
        setMentionQuery(query);
        
        // Filter mention options based on query
        setFilteredMentions({
          users: mentionOptions.users.filter(user => 
            user.name.toLowerCase().includes(query)),
          workOrders: mentionOptions.workOrders.filter(wo => 
            wo.name.toLowerCase().includes(query)),
          parts: mentionOptions.parts.filter(part => 
            part.name.toLowerCase().includes(query))
        });
      } else {
        setMentionDropdownOpen(false);
      }
    }
  };

  const insertMention = (item: {id: string, name: string, type: string}) => {
    if (!textareaRef.current) return;
    
    const text = messageText;
    const position = textareaRef.current.selectionStart || 0;
    const textBeforeCursor = text.substring(0, position);
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = text.substring(position);
    
    // Format the mention based on type
    let mentionText = '';
    switch(item.type) {
      case 'user':
        mentionText = `@${item.name} `;
        break;
      case 'work_order':
        mentionText = `#${item.name} `;
        break;
      case 'part':
        mentionText = `$${item.name} `;
        break;
      default:
        mentionText = `@${item.name} `;
    }
    
    const newText = textBeforeCursor.substring(0, mentionStart) + mentionText + textAfterCursor;
    setMessageText(newText);
    setMentionDropdownOpen(false);
    
    // Set focus back to textarea and put cursor after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = mentionStart + mentionText.length;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
      }
    }, 0);
  };

  // Determine if we should show the main chat view or the thread view
  const showThread = activeThreadId && threadMessages && threadMessages[activeThreadId];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border">
      {/* Chat Header */}
      {room ? (
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{room.name}</h2>
            {room.type === 'work_order' && (
              <div className="flex items-center">
                <Badge variant="outline" className="mr-1">Work Order</Badge>
                {onViewInfo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                    onClick={onViewInfo}
                  >
                    View Details
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onPinRoom && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onPinRoom}
                      className={room.is_pinned ? 'text-amber-500' : ''}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {room.is_pinned ? 'Unpin conversation' : 'Pin conversation'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {onArchiveRoom && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm" 
                      onClick={onArchiveRoom}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Archive conversation
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 border-b">
          <p className="text-slate-500">Select a conversation to start chatting</p>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {!room ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-slate-600">Your Messages</h3>
              <p className="text-sm text-slate-500 mt-1">
                Select a conversation from the sidebar
              </p>
            </div>
          </div>
        ) : showThread ? (
          // Thread view
          <ChatThread
            parentMessage={messages.find(m => m.id === activeThreadId)!}
            messages={threadMessages[activeThreadId] || []}
            userId={userId}
            onClose={onCloseThread}
            onEdit={onEditMessage}
            onFlag={onFlagMessage}
          />
        ) : (
          // Main chat view
          <>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-slate-500">No messages yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Be the first to send a message
                  </p>
                </div>
              </div>
            ) : (
              messages.map(message => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  isCurrentUser={message.sender_id === userId}
                  userId={userId}
                  onEdit={onEditMessage}
                  onFlag={onFlagMessage}
                  onReply={onOpenThread}
                />
              ))
            )}
            <div ref={messagesEndRef} />
            
            {/* Typing indicators */}
            {isTyping && typingUsers && typingUsers.length > 0 && (
              <div className="text-xs text-slate-500 italic mt-2">
                {typingUsers.map(user => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Input Area */}
      {room && (
        <div className="border-t p-3 bg-white">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={activeThreadId ? "Reply to thread..." : "Type your message... Use @ to mention, # for work orders, $ for parts"}
              className="min-h-[80px] pr-24 resize-none focus:ring-1 focus:ring-blue-500"
              disabled={!room}
            />
            
            {/* Mentions dropdown */}
            {mentionDropdownOpen && (
              <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg w-72 max-h-60 overflow-y-auto">
                {filteredMentions.users.length > 0 && (
                  <div>
                    <div className="px-2 py-1 bg-slate-100 text-xs font-medium">Users</div>
                    {filteredMentions.users.map(user => (
                      <div 
                        key={user.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => insertMention(user)}
                      >
                        <span className="text-blue-600">@</span>{user.name}
                      </div>
                    ))}
                  </div>
                )}
                {filteredMentions.workOrders.length > 0 && (
                  <div>
                    <div className="px-2 py-1 bg-slate-100 text-xs font-medium">Work Orders</div>
                    {filteredMentions.workOrders.map(wo => (
                      <div 
                        key={wo.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => insertMention(wo)}
                      >
                        <span className="text-green-600">#</span>{wo.name}
                      </div>
                    ))}
                  </div>
                )}
                {filteredMentions.parts.length > 0 && (
                  <div>
                    <div className="px-2 py-1 bg-slate-100 text-xs font-medium">Parts</div>
                    {filteredMentions.parts.map(part => (
                      <div 
                        key={part.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => insertMention(part)}
                      >
                        <span className="text-amber-600">$</span>{part.name}
                      </div>
                    ))}
                  </div>
                )}
                {filteredMentions.users.length === 0 && 
                 filteredMentions.workOrders.length === 0 && 
                 filteredMentions.parts.length === 0 && (
                  <div className="px-3 py-2 text-slate-500">
                    No matches found
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 flex">
              {onSendFileMessage && (
                <FileUploadButton onFileSelected={onSendFileMessage} />
              )}
              <Button 
                onClick={() => onSendMessage(activeThreadId)}
                disabled={!messageText.trim()}
                size="sm"
                className="ml-2"
              >
                <SendHorizontal className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
