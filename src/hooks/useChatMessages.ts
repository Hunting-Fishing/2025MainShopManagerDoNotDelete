
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendChatMessage, 
  subscribeToMessages, 
  subscribeToMessageUpdates,
  flagChatMessage,
  editChatMessage,
  getThreadMessages,
  setTypingIndicator,
  clearTypingIndicator,
  subscribeToTypingIndicators,
  TypingIndicator
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';
import { uploadChatFile } from '@/components/chat/file/fileService';

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  // Fetch messages for current room
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
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
  }, [currentRoomId]);
  
  // Subscribe to new messages in the current room
  useEffect(() => {
    if (!currentRoomId) return;
    
    // Subscribe to messages
    const unsubscribeMessages = subscribeToMessages(currentRoomId, (newMessage) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.some(msg => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });
    
    // Subscribe to message updates
    const unsubscribeUpdates = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages(prev => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
      
      // If thread is open and the updated message is part of it, update thread messages too
      if (activeThreadId && threadMessages[activeThreadId]) {
        setThreadMessages(prev => ({
          ...prev,
          [activeThreadId]: prev[activeThreadId].map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        }));
      }
    });
    
    return () => {
      unsubscribeMessages();
      unsubscribeUpdates();
    };
  }, [currentRoomId, activeThreadId, threadMessages]);
  
  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId || !userId) return;
    
    const unsubscribeTyping = subscribeToTypingIndicators(currentRoomId, (indicators: TypingIndicator[]) => {
      // Filter out current user and transform to expected format
      const transformedUsers = indicators
        .filter(indicator => indicator.user_id !== userId)
        .map(indicator => ({
          id: indicator.user_id,
          name: indicator.user_name
        }));
      
      setTypingUsers(transformedUsers);
    });
    
    return () => {
      unsubscribeTyping();
    };
  }, [currentRoomId, userId]);
  
  // Handle sending a new message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      
      // Clear typing indicator
      if (isTyping) {
        await clearTypingIndicator(currentRoomId, userId);
        setIsTyping(false);
      }
      
      // Send the message
      const sentMessage = await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: newMessageText,
        threadParentId
      });
      
      // Clear the input
      setNewMessageText('');
      
      // If this is a thread message, update thread messages
      if (threadParentId) {
        // Fetch updated thread messages
        const updatedThreadMessages = await getThreadMessages(threadParentId);
        setThreadMessages(prev => ({
          ...prev,
          [threadParentId]: updatedThreadMessages
        }));
      }
      
      return sentMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Couldn't send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName, newMessageText, isTyping, typingTimeout]);
  
  // Handle sending voice messages
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      // Send the voice message
      const sentMessage = await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: `Shared a voice message`,
        messageType: 'audio',
        file_url: audioUrl,
        threadParentId
      });
      
      // If this is a thread message, update thread messages
      if (threadParentId) {
        // Fetch updated thread messages
        const updatedThreadMessages = await getThreadMessages(threadParentId);
        setThreadMessages(prev => ({
          ...prev,
          [threadParentId]: updatedThreadMessages
        }));
      }
      
      return sentMessage;
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast({
        title: "Error",
        description: "Couldn't send voice message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);
  
  // Handle sending file messages
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      // Determine message type from fileUrl
      let messageType = 'file';
      if (fileUrl.startsWith('image:')) messageType = 'image';
      else if (fileUrl.startsWith('video:')) messageType = 'video';
      else if (fileUrl.startsWith('audio:')) messageType = 'audio';
      
      // Send the file message
      const sentMessage = await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: `Shared a ${messageType} file`,
        messageType,
        file_url: fileUrl,
        threadParentId
      });
      
      // If this is a thread message, update thread messages
      if (threadParentId) {
        // Fetch updated thread messages
        const updatedThreadMessages = await getThreadMessages(threadParentId);
        setThreadMessages(prev => ({
          ...prev,
          [threadParentId]: updatedThreadMessages
        }));
      }
      
      return sentMessage;
    } catch (error) {
      console.error('Failed to send file message:', error);
      toast({
        title: "Error",
        description: "Couldn't send file. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!currentRoomId) return;
    
    // If already marked as typing, just update timeout
    if (isTyping) {
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Set a new timeout to clear typing status if user stops typing
      const timeout = setTimeout(async () => {
        await clearTypingIndicator(currentRoomId, userId);
        setIsTyping(false);
        setTypingTimeout(null);
      }, 5000);
      
      setTypingTimeout(timeout);
      return;
    }
    
    // Set typing status
    const setTyping = async () => {
      await setTypingIndicator(currentRoomId, userId, userName);
      setIsTyping(true);
      
      // Set timeout to automatically clear typing status
      const timeout = setTimeout(async () => {
        await clearTypingIndicator(currentRoomId, userId);
        setIsTyping(false);
        setTypingTimeout(null);
      }, 5000);
      
      setTypingTimeout(timeout);
    };
    
    setTyping();
  }, [currentRoomId, userId, userName, isTyping, typingTimeout]);
  
  // Flag a message as inappropriate
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
      toast({
        title: "Message reported",
        description: "Thank you for reporting this message.",
      });
    } catch (error) {
      console.error('Failed to flag message:', error);
      toast({
        title: "Error",
        description: "Couldn't report message. Please try again.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await editChatMessage(messageId, content);
      toast({
        title: "Message edited",
      });
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast({
        title: "Error",
        description: "Couldn't edit message. Please try again.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Open a thread
  const handleThreadOpen = useCallback(async (messageId: string) => {
    try {
      // Fetch thread messages
      const threadMsgs = await getThreadMessages(messageId);
      setThreadMessages(prev => ({
        ...prev,
        [messageId]: threadMsgs
      }));
      setActiveThreadId(messageId);
    } catch (error) {
      console.error('Failed to open thread:', error);
      toast({
        title: "Error",
        description: "Couldn't load replies. Please try again.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Close thread
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);
  
  // Get thread replies
  const getThreadReplies = useCallback(async (parentMessageId: string) => {
    try {
      const replies = await getThreadMessages(parentMessageId);
      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: replies
      }));
      return replies;
    } catch (error) {
      console.error('Failed to get thread replies:', error);
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
