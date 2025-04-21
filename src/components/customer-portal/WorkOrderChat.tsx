
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadButton } from '@/components/chat/file/FileUploadButton';
import { toast } from '@/hooks/use-toast';

interface WorkOrderChatProps {
  workOrderId: string;
  shopName?: string;
}

export const WorkOrderChat: React.FC<WorkOrderChatProps> = ({ workOrderId, shopName = "Service Shop" }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // On component mount, load mock message history
  useEffect(() => {
    // Simulate loading messages from API
    setIsLoading(true);
    
    // Create some mock messages
    const mockMessages: ChatMessage[] = [
      {
        id: uuidv4(),
        room_id: workOrderId,
        sender_id: 'shop',
        sender_name: shopName,
        content: `Welcome! Your work order #${workOrderId.substring(0, 8)} has been created. We'll keep you updated on progress here.`,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        is_read: true,
        message_type: 'text'
      },
      {
        id: uuidv4(),
        room_id: workOrderId,
        sender_id: 'shop',
        sender_name: 'John (Technician)',
        content: "I've started the diagnostic on your vehicle. I'll update you once I have more information.",
        created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        is_read: true,
        message_type: 'text'
      },
      {
        id: uuidv4(),
        room_id: workOrderId,
        sender_id: 'customer',
        sender_name: 'You',
        content: "Thanks for the update. Can you let me know approximately when it will be ready?",
        created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        is_read: true,
        message_type: 'text'
      }
    ];
    
    setTimeout(() => {
      setMessages(mockMessages);
      setIsLoading(false);
    }, 800);
  }, [workOrderId, shopName]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      room_id: workOrderId,
      sender_id: 'customer',
      sender_name: 'You',
      content: messageText,
      created_at: new Date().toISOString(),
      is_read: true,
      message_type: 'text',
      is_edited: false,
      edited_at: undefined,
      file_url: undefined,
      flag_reason: undefined,
      is_flagged: false,
      metadata: undefined,
      reply_to_id: undefined,
      reply_to_message: undefined,
      thread_count: 0,
      thread_parent_id: undefined
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const response: ChatMessage = {
        id: uuidv4(),
        room_id: workOrderId,
        sender_id: 'shop',
        sender_name: 'John (Technician)',
        content: "Thanks for your message. We're currently working on your vehicle and expect it to be ready by end of day. I'll send you another update once we're closer to completion.",
        created_at: new Date().toISOString(),
        is_read: true,
        message_type: 'text',
        is_edited: false,
        edited_at: undefined,
        file_url: undefined,
        flag_reason: undefined,
        is_flagged: false,
        metadata: undefined,
        reply_to_id: undefined,
        reply_to_message: undefined,
        thread_count: 0,
        thread_parent_id: undefined
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUploaded = (fileUrl: string, fileType: string, caption?: string) => {
    // Create a new message with file attachment
    const fileMessage: ChatMessage = {
      id: uuidv4(),
      room_id: workOrderId,
      sender_id: 'customer',
      sender_name: 'You',
      content: caption || `Shared a ${fileType} file`,
      created_at: new Date().toISOString(),
      is_read: true,
      message_type: fileType as 'image' | 'audio' | 'video' | 'file' | 'text',
      file_url: fileUrl,
      is_edited: false,
      edited_at: undefined,
      flag_reason: undefined,
      is_flagged: false,
      metadata: undefined,
      reply_to_id: undefined,
      reply_to_message: undefined,
      thread_count: 0,
      thread_parent_id: undefined
    };
    
    setMessages(prev => [...prev, fileMessage]);
  };

  const handleFileSelected = async (fileUrl: string) => {
    // Additional handling if needed for file selection
    toast({
      title: "File attached",
      description: "Your file has been attached to the message",
      variant: "success",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-blue-600 text-white font-medium">
        <h2>Chat with {shopName}</h2>
        <p className="text-xs text-blue-100">Work Order #{workOrderId.substring(0, 8)}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-slate-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender_id === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === 'customer' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium">{message.sender_name}</span>
                    <span className="text-xs opacity-70 ml-2">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {message.file_url ? (
                    <div className="mt-1">
                      {message.message_type === 'image' && (
                        <img 
                          src={message.file_url.split(':')[1]} 
                          alt="Shared image" 
                          className="max-w-full rounded-md"
                        />
                      )}
                      {message.message_type === 'file' && (
                        <div className="flex items-center p-2 bg-slate-200 text-slate-800 rounded-md">
                          <span>📄 File attachment</span>
                          <a 
                            href={message.file_url.split(':')[1]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      )}
                      {message.content && <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <FileUploadButton 
            roomId={workOrderId}
            onFileUploaded={handleFileUploaded}
            onFileSelected={handleFileSelected}
            isDisabled={isLoading}
          />
          
          <Input 
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading}
            className="rounded-full flex-shrink-0"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
