
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendChatMessage, 
  subscribeToMessages, 
  subscribeToMessageUpdates,
  getThreadMessages,
  setTypingIndicator, 
  clearTypingIndicator,
  subscribeToTypingIndicators,
  TypingIndicator,
  editChatMessage,
  flagChatMessage
} from '@/services/chat';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({
  userId,
  userName,
  currentRoomId
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Fetch messages when room changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoomId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Reset state when room changes
    setNewMessageText('');
    setActiveThreadId(null);
    setThreadMessages({});
    
  }, [currentRoomId]);

  // Subscribe to new messages and updates
  useEffect(() => {
    if (!currentRoomId) return;

    // Subscribe to new messages
    const unsubscribeNewMessages = subscribeToMessages(
      currentRoomId, 
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      }
    );
    
    // Subscribe to message updates
    const unsubscribeMessageUpdates = subscribeToMessageUpdates(
      currentRoomId,
      (updatedMessage) => {
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
        
        // Also update in thread messages if present
        if (updatedMessage.thread_parent_id && threadMessages[updatedMessage.thread_parent_id]) {
          setThreadMessages(prev => ({
            ...prev,
            [updatedMessage.thread_parent_id!]: prev[updatedMessage.thread_parent_id!].map(
              msg => msg.id === updatedMessage.id ? updatedMessage : msg
            )
          }));
        }
      }
    );

    // Subscribe to typing indicators
    const unsubscribeTypingIndicators = subscribeToTypingIndicators(
      currentRoomId,
      (indicators: TypingIndicator[]) => {
        // Filter out the current user and transform to the format we need
        const otherUsers = indicators
          .filter(indicator => indicator.user_id !== userId)
          .map(indicator => ({
            id: indicator.user_id,
            name: indicator.user_name
          }));
        
        setTypingUsers(otherUsers);
      }
    );
    
    return () => {
      unsubscribeNewMessages();
      unsubscribeMessageUpdates();
      unsubscribeTypingIndicators();
    };
  }, [currentRoomId, userId, threadMessages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!userId || !currentRoomId || !userName) return;
    
    setIsTyping(true);
    
    // Clear previous timeout if exists
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set typing indicator on the server
    setTypingIndicator(currentRoomId, userId, userName);
    
    // Set timeout to clear typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      clearTypingIndicator(currentRoomId, userId);
    }, 3000);
    
    setTypingTimeout(timeout as unknown as ReturnType<typeof setTimeout>);
  }, [currentRoomId, userId, userName, typingTimeout]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Send message function
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: newMessageText,
        threadParentId
      });
      
      setNewMessageText('');
      
      // If sending a thread message, refresh the thread
      if (threadParentId) {
        const threadReplies = await getThreadMessages(threadParentId);
        setThreadMessages(prev => ({
          ...prev,
          [threadParentId]: threadReplies
        }));
      }
      
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    }
  }, [currentRoomId, newMessageText, userId, userName]);

  // Send voice message function
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: "Audio message",
        messageType: 'audio',
        threadParentId,
        file_url: audioUrl
      });
      
      // If sending a thread message, refresh the thread
      if (threadParentId) {
        const threadReplies = await getThreadMessages(threadParentId);
        setThreadMessages(prev => ({
          ...prev,
          [threadParentId]: threadReplies
        }));
      }
      
    } catch (err: any) {
      console.error('Error sending voice message:', err);
      setError(err.message || 'Failed to send voice message');
    }
  }, [currentRoomId, userId, userName]);

  // Send file message function
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: "File attachment",
        messageType: 'file',
        threadParentId,
        file_url: fileUrl
      });
      
      // If sending a thread message, refresh the thread
      if (threadParentId) {
        const threadReplies = await getThreadMessages(threadParentId);
        setThreadMessages(prev => ({
          ...prev,
          [threadParentId]: threadReplies
        }));
      }
      
    } catch (err: any) {
      console.error('Error sending file message:', err);
      setError(err.message || 'Failed to send file');
    }
  }, [currentRoomId, userId, userName]);

  // Handle flag message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
    } catch (err: any) {
      console.error('Error flagging message:', err);
      setError(err.message || 'Failed to flag message');
    }
  }, []);

  // Handle edit message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await editChatMessage(messageId, content);
    } catch (err: any) {
      console.error('Error editing message:', err);
      setError(err.message || 'Failed to edit message');
    }
  }, []);

  // Open thread
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    
    try {
      // Check if we already have thread messages loaded
      if (!threadMessages[messageId]) {
        const threadReplies = await getThreadMessages(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: threadReplies
        }));
      }
    } catch (err: any) {
      console.error('Error loading thread:', err);
      setError(err.message || 'Failed to load thread');
    }
  }, [threadMessages]);

  // Close thread
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Get thread replies
  const getThreadReplies = useCallback(async (messageId: string) => {
    try {
      const threadReplies = await getThreadMessages(messageId);
      return threadReplies;
    } catch (err: any) {
      console.error('Error getting thread replies:', err);
      setError(err.message || 'Failed to get thread replies');
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
