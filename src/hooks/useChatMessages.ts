
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatRoomMessages, 
  sendMessage, 
  flagChatMessage, 
  editChatMessage,
  getThreadReplies as fetchReplies
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  
  // For typing indicators
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  
  // For thread replies
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages for current room
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoomId || !userId) {
        setMessages([]);
        return;
      }
      
      try {
        setLoading(true);
        const fetchedMessages = await getChatRoomMessages(currentRoomId);
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Reset state when changing rooms
    setNewMessageText('');
    setIsTyping(false);
    setTypingUsers([]);
    setActiveThreadId(null);
    
  }, [currentRoomId, userId]);

  // Send a new message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !userId || !newMessageText.trim()) return;
    
    try {
      const messageContent = newMessageText.trim();
      const messageData = {
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName || 'Unknown User',
        content: messageContent,
        threadParentId
      };
      
      // Clear input field immediately for better UX
      setNewMessageText('');
      
      const sentMessage = await sendMessage(messageData);
      
      // Update UI based on whether it's a thread reply or a main message
      if (threadParentId) {
        // If it's a reply, update thread messages
        setThreadMessages(prev => {
          const existingReplies = prev[threadParentId] || [];
          return {
            ...prev,
            [threadParentId]: [...existingReplies, sentMessage]
          };
        });
        
        // Also update the thread count in the parent message
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === threadParentId 
              ? { ...msg, thread_count: (msg.thread_count || 0) + 1 } 
              : msg
          )
        );
      } else {
        // If it's a main message, add to messages list
        setMessages(prevMessages => [...prevMessages, sentMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName, newMessageText]);

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) return;
    
    try {
      const messageData = {
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName || 'Unknown User',
        content: "Voice message",
        messageType: 'audio' as const,
        fileUrl: audioUrl,
        threadParentId
      };
      
      const sentMessage = await sendMessage(messageData);
      
      // Update UI based on whether it's a thread reply or a main message
      if (threadParentId) {
        // Update thread messages
        setThreadMessages(prev => {
          const existingReplies = prev[threadParentId] || [];
          return {
            ...prev,
            [threadParentId]: [...existingReplies, sentMessage]
          };
        });
        
        // Update thread count
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === threadParentId 
              ? { ...msg, thread_count: (msg.thread_count || 0) + 1 } 
              : msg
          )
        );
      } else {
        setMessages(prevMessages => [...prevMessages, sentMessage]);
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) return;
    
    try {
      // Extract file type from the URL format (e.g., "image:https://...")
      const [fileType, url] = fileUrl.split(':', 2);
      
      const messageData = {
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName || 'Unknown User',
        content: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} attachment`,
        messageType: fileType as 'image' | 'video' | 'file',
        fileUrl: url,
        threadParentId
      };
      
      const sentMessage = await sendMessage(messageData);
      
      // Update UI based on whether it's a thread reply or a main message
      if (threadParentId) {
        // Update thread messages
        setThreadMessages(prev => {
          const existingReplies = prev[threadParentId] || [];
          return {
            ...prev,
            [threadParentId]: [...existingReplies, sentMessage]
          };
        });
        
        // Update thread count
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === threadParentId 
              ? { ...msg, thread_count: (msg.thread_count || 0) + 1 } 
              : msg
          )
        );
      } else {
        setMessages(prevMessages => [...prevMessages, sentMessage]);
      }
      
    } catch (error) {
      console.error('Error sending file message:', error);
      toast({
        title: "Error",
        description: "Failed to send file attachment",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
      
      // Update the message in the UI
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_flagged: true, flag_reason: reason } 
            : msg
        )
      );
      
      // Also update in thread messages if present
      setThreadMessages(prevThreads => {
        const updatedThreads = { ...prevThreads };
        
        Object.keys(updatedThreads).forEach(threadId => {
          updatedThreads[threadId] = updatedThreads[threadId].map(msg => 
            msg.id === messageId 
              ? { ...msg, is_flagged: true, flag_reason: reason } 
              : msg
          );
        });
        
        return updatedThreads;
      });
      
      toast({
        title: "Message flagged",
        description: "The message has been flagged for review",
      });
    } catch (error) {
      console.error('Error flagging message:', error);
      toast({
        title: "Error",
        description: "Failed to flag message",
        variant: "destructive",
      });
    }
  }, []);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const updatedMessage = await editChatMessage(messageId, newContent);
      
      // Update the message in the UI
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        )
      );
      
      // Also update in thread messages if present
      setThreadMessages(prevThreads => {
        const updatedThreads = { ...prevThreads };
        
        Object.keys(updatedThreads).forEach(threadId => {
          updatedThreads[threadId] = updatedThreads[threadId].map(msg => 
            msg.id === messageId ? updatedMessage : msg
          );
        });
        
        return updatedThreads;
      });
      
      toast({
        title: "Message updated",
        description: "Your message has been updated",
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      });
    }
  }, []);

  // Handle typing indicators
  const handleTyping = useCallback((isTyping: boolean) => {
    setIsTyping(isTyping);
    // In a real app, you would emit this to other users
    // For now, we'll just update the local state
  }, []);

  // Handle thread opening
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    
    // Fetch thread replies if we don't have them yet
    if (!threadMessages[messageId]) {
      try {
        const replies = await fetchReplies(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: replies
        }));
      } catch (error) {
        console.error('Error fetching thread replies:', error);
        toast({
          title: "Error",
          description: "Failed to load thread replies",
          variant: "destructive",
        });
      }
    }
  }, [threadMessages]);

  // Handle thread closing
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Get thread replies
  const getThreadReplies = useCallback(async (messageId: string) => {
    try {
      const replies = await fetchReplies(messageId);
      setThreadMessages(prev => ({
        ...prev,
        [messageId]: replies
      }));
      return replies;
    } catch (error) {
      console.error('Error fetching thread replies:', error);
      toast({
        title: "Error",
        description: "Failed to load thread replies",
        variant: "destructive",
      });
      return [];
    }
  }, []);

  return {
    messages,
    loading,
    error,
    newMessageText,
    setNewMessageText,
    handleSendMessage,
    handleSendVoiceMessage,
    handleSendFileMessage,
    flagMessage,
    handleEditMessage,
    isTyping,
    typingUsers,
    handleTyping,
    threadMessages,
    activeThreadId,
    handleThreadOpen,
    handleThreadClose,
    getThreadReplies
  };
};
