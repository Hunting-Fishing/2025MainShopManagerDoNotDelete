
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  getThreadReplies,
  sendChatMessage, 
  editChatMessage, 
  flagChatMessage, 
  sendThreadReply, 
  subscribeToMessages, 
  subscribeToMessageUpdates, 
  TypingIndicator,
  setTypingIndicator, 
  clearTypingIndicator,
  getTypingIndicators,
  subscribeToTypingIndicators
} from '@/services/chat';

// More descriptive props interface
interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages when room changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoomId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getChatMessages(currentRoomId);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentRoomId]);
  
  // Subscribe to new messages
  useEffect(() => {
    if (!currentRoomId) return;
    
    const unsubscribe = subscribeToMessages(currentRoomId, (newMessage) => {
      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        if (prevMessages.some(msg => msg.id === newMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
    });
    
    return unsubscribe;
  }, [currentRoomId]);
  
  // Subscribe to message updates
  useEffect(() => {
    if (!currentRoomId) return;
    
    const unsubscribe = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    });
    
    return unsubscribe;
  }, [currentRoomId]);

  // Handle typing indicators subscription
  useEffect(() => {
    if (!currentRoomId || !userId) return;
    
    const handleTypingUpdate = (indicators: TypingIndicator[]) => {
      const typingUsersList = indicators
        .filter(indicator => indicator.user_id !== userId)
        .map(indicator => ({
          id: indicator.user_id,
          name: indicator.user_name
        }));
      
      setTypingUsers(typingUsersList);
    };
    
    const unsubscribe = subscribeToTypingIndicators(currentRoomId, handleTypingUpdate);
    
    // Initial fetch of typing indicators
    getTypingIndicators(currentRoomId)
      .then(handleTypingUpdate)
      .catch(console.error);
      
    return unsubscribe;
  }, [currentRoomId, userId]);
  
  // Send message handler
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText,
        thread_parent_id: threadParentId
      };
      
      // Clear typing indicator
      await clearTypingIndicator(currentRoomId, userId);
      
      // If it's a thread reply, use sendThreadReply
      if (threadParentId) {
        await sendThreadReply(messageParams);
        
        // Update thread messages locally
        fetchThreadReplies(threadParentId);
      } else {
        // Regular message
        await sendChatMessage(messageParams);
      }
      
      // Clear message text
      setNewMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    }
  }, [currentRoomId, userId, userName, newMessageText]);
  
  // Send voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: 'Audio message',
        message_type: 'audio' as const,
        file_url: audioUrl,
        thread_parent_id: threadParentId
      };
      
      if (threadParentId) {
        await sendThreadReply(messageParams);
        fetchThreadReplies(threadParentId);
      } else {
        await sendChatMessage(messageParams);
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send voice message'));
    }
  }, [currentRoomId, userId, userName]);
  
  // Send file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: fileUrl,
        message_type: 'file' as const,
        file_url: fileUrl,
        thread_parent_id: threadParentId
      };
      
      if (threadParentId) {
        await sendThreadReply(messageParams);
        fetchThreadReplies(threadParentId);
      } else {
        await sendChatMessage(messageParams);
      }
    } catch (err) {
      console.error('Error sending file message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send file message'));
    }
  }, [currentRoomId, userId, userName]);
  
  // Flag message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage({ messageId, reason });
    } catch (err) {
      console.error('Error flagging message:', err);
      setError(err instanceof Error ? err : new Error('Failed to flag message'));
    }
  }, []);
  
  // Edit message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await editChatMessage({ messageId, content, userId });
      
      // Update message locally to show changes immediately
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, content, is_edited: true, edited_at: new Date().toISOString() } 
            : msg
        )
      );
      
      // If this is a thread message, also update thread messages state
      if (activeThreadId) {
        setThreadMessages(prev => {
          const updatedThreads = { ...prev };
          
          Object.keys(updatedThreads).forEach(threadId => {
            updatedThreads[threadId] = updatedThreads[threadId].map(msg => 
              msg.id === messageId 
                ? { ...msg, content, is_edited: true, edited_at: new Date().toISOString() } 
                : msg
            );
          });
          
          return updatedThreads;
        });
      }
    } catch (err) {
      console.error('Error editing message:', err);
      setError(err instanceof Error ? err : new Error('Failed to edit message'));
    }
  }, [userId, activeThreadId]);
  
  // Handle typing
  const handleTyping = useCallback((isUserTyping: boolean) => {
    if (!currentRoomId) return;
    
    // Clear previous timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    if (isUserTyping) {
      // Set typing indicator
      setTypingIndicator(currentRoomId, userId, userName)
        .catch(err => console.error('Error setting typing indicator:', err));
      
      // Auto-clear after 5 seconds
      typingTimeoutRef.current = setTimeout(() => {
        clearTypingIndicator(currentRoomId, userId)
          .catch(err => console.error('Error clearing typing indicator:', err));
        
        typingTimeoutRef.current = null;
      }, 5000);
    } else {
      // Clear typing indicator if user stopped typing
      clearTypingIndicator(currentRoomId, userId)
        .catch(err => console.error('Error clearing typing indicator:', err));
    }
    
    setIsTyping(isUserTyping);
  }, [currentRoomId, userId, userName]);
  
  // Fetch thread replies
  const fetchThreadReplies = useCallback(async (parentId: string) => {
    if (!parentId) return;
    
    try {
      const replies = await getThreadReplies(parentId);
      
      setThreadMessages(prev => ({
        ...prev,
        [parentId]: replies
      }));
      
      return replies;
    } catch (err) {
      console.error('Error fetching thread replies:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch thread replies'));
      return [];
    }
  }, []);
  
  // Thread handlers
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    
    if (!threadMessages[messageId]) {
      await fetchThreadReplies(messageId);
    }
  }, [threadMessages, fetchThreadReplies]);
  
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
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
    fetchThreadReplies
  };
};
