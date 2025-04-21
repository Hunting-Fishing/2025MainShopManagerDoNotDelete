
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages,
  sendChatMessage,
  flagChatMessage,
  editChatMessage,
  getThreadMessages,
  subscribeToMessages,
  subscribeToMessageUpdates,
  subscribeToTypingIndicators,
  setTypingIndicator,
  clearTypingIndicator
} from '@/services/chat';
import { ChatFileInfo } from '@/services/chat/file';
import { formatFileMessage } from '@/services/chat/file/fileMessageFormatter';
import { useDebounce } from './useDebounce';
import { toast } from './use-toast';

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
  
  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ user_id: string; user_name: string }[]>([]);
  const debouncedMessageText = useDebounce(newMessageText, 500);
  
  // Thread state
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  // Fetch messages for the current room
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoomId || !userId) return;
      
      setLoading(true);
      setError(null);
      try {
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        toast({
          title: "Error",
          description: "Couldn't load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentRoomId, userId]);
  
  // Subscribe to new messages and updates
  useEffect(() => {
    if (!currentRoomId || !userId) return;
    
    // Subscribe to new messages
    const unsubscribeMessages = subscribeToMessages(currentRoomId, (message) => {
      setMessages(prev => {
        // Check if this message is already in our list (avoid duplicates)
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });
    
    // Subscribe to message updates (edits, flags, etc)
    const unsubscribeUpdates = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages(prev => 
        prev.map(message => 
          message.id === updatedMessage.id ? updatedMessage : message
        )
      );
      
      // Also update thread messages if applicable
      if (updatedMessage.thread_parent_id && threadMessages[updatedMessage.thread_parent_id]) {
        setThreadMessages(prev => ({
          ...prev,
          [updatedMessage.thread_parent_id as string]: prev[updatedMessage.thread_parent_id as string].map(
            message => message.id === updatedMessage.id ? updatedMessage : message
          )
        }));
      }
    });
    
    // Subscribe to typing indicators
    const unsubscribeTyping = subscribeToTypingIndicators(currentRoomId, (indicators) => {
      // Filter out current user and transform to expected format
      const others = indicators
        .filter(indicator => indicator.user_id !== userId)
        .map(indicator => ({
          user_id: indicator.user_id,
          user_name: indicator.user_name
        }));
      
      setTypingUsers(others);
    });
    
    return () => {
      unsubscribeMessages();
      unsubscribeUpdates();
      unsubscribeTyping();
    };
  }, [currentRoomId, userId, threadMessages]);
  
  // Handle typing indicator
  useEffect(() => {
    if (!currentRoomId || !userId || !userName) return;
    
    if (newMessageText && !isTyping) {
      setIsTyping(true);
      setTypingIndicator(currentRoomId, userId, userName).catch(console.error);
    } else if (!newMessageText && isTyping) {
      setIsTyping(false);
      clearTypingIndicator(currentRoomId, userId).catch(console.error);
    }
  }, [newMessageText, userId, userName, currentRoomId, isTyping]);
  
  // Debounced effect to clear typing indicator after a period of inactivity
  useEffect(() => {
    if (!currentRoomId || !userId || !isTyping) return;
    
    if (!debouncedMessageText) {
      setIsTyping(false);
      clearTypingIndicator(currentRoomId, userId).catch(console.error);
    }
  }, [debouncedMessageText, userId, currentRoomId, isTyping]);
  
  // Send message function
  const handleSendMessage = useCallback(async (threadParentId?: string): Promise<ChatMessage> => {
    if (!currentRoomId || !userId || !userName) {
      throw new Error('Missing required information to send message');
    }
    
    const content = newMessageText.trim();
    if (!content) {
      throw new Error('Message cannot be empty');
    }
    
    try {
      const message = await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content,
        messageType: 'text',
        threadParentId
      });
      
      setNewMessageText('');
      setIsTyping(false);
      clearTypingIndicator(currentRoomId, userId).catch(console.error);
      
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  }, [currentRoomId, userId, userName, newMessageText]);
  
  // Send voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string): Promise<ChatMessage> => {
    if (!currentRoomId || !userId || !userName) {
      throw new Error('Missing required information to send message');
    }
    
    try {
      const content = `audio:${audioUrl}|audio-recording.mp3|0|audio/mp3`;
      const message = await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content,
        messageType: 'audio',
        threadParentId
      });
      
      return message;
    } catch (err) {
      console.error('Error sending voice message:', err);
      toast({
        title: "Error",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  }, [currentRoomId, userId, userName]);
  
  // Send file message
  const handleSendFileMessage = useCallback(async (fileInfo: string | ChatFileInfo, threadParentId?: string): Promise<ChatMessage> => {
    if (!currentRoomId || !userId || !userName) {
      throw new Error('Missing required information to send message');
    }
    
    try {
      // If fileInfo is a string (URL), convert it to a simple file info object
      const content = typeof fileInfo === 'string' 
        ? `file:${fileInfo}|file.txt|0|text/plain` 
        : formatFileMessage(fileInfo);
      
      // Determine message type from file info
      let messageType: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (typeof fileInfo !== 'string') {
        if (fileInfo.type === 'image') messageType = 'image';
        else if (fileInfo.type === 'video') messageType = 'video';
        else if (fileInfo.type === 'audio') messageType = 'audio';
      }
      
      const message = await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content,
        messageType,
        threadParentId
      });
      
      return message;
    } catch (err) {
      console.error('Error sending file message:', err);
      toast({
        title: "Error",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  }, [currentRoomId, userId, userName]);
  
  // Flag message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
      toast({
        title: "Message Flagged",
        description: "The message has been flagged for review.",
      });
    } catch (err) {
      console.error('Error flagging message:', err);
      toast({
        title: "Error",
        description: "Failed to flag message. Please try again.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Edit message
  const handleEditMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    try {
      await editChatMessage(messageId, content);
    } catch (err) {
      console.error('Error editing message:', err);
      toast({
        title: "Error",
        description: "Failed to edit message. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  }, []);
  
  // Handle typing status updates
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId || !userName) return;
    
    if (!isTyping && newMessageText) {
      setIsTyping(true);
      setTypingIndicator(currentRoomId, userId, userName).catch(console.error);
    }
  }, [currentRoomId, userId, userName, isTyping, newMessageText]);
  
  // Thread handling
  const handleThreadOpen = useCallback(async (messageId: string) => {
    if (!currentRoomId) return;
    
    setActiveThreadId(messageId);
    
    try {
      // Only fetch if we don't already have this thread's messages
      if (!threadMessages[messageId]) {
        const replies = await getThreadMessages(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: replies
        }));
      }
    } catch (err) {
      console.error('Error fetching thread messages:', err);
      toast({
        title: "Error",
        description: "Failed to load thread replies. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, threadMessages]);
  
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);
  
  const getThreadReplies = useCallback(async (threadParentId: string) => {
    try {
      const replies = await getThreadMessages(threadParentId);
      setThreadMessages(prev => ({
        ...prev,
        [threadParentId]: replies
      }));
      return replies;
    } catch (err) {
      console.error('Error fetching thread messages:', err);
      toast({
        title: "Error",
        description: "Failed to load thread replies. Please try again.",
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
