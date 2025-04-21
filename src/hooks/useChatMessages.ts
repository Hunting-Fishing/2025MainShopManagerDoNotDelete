
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  getThreadReplies, 
  sendChatMessage,
  sendThreadReply,
  editChatMessage as editMessage,
  flagChatMessage as flagMsg,
  subscribeToMessages,
  subscribeToMessageUpdates,
  setTypingIndicator,
  clearTypingIndicator,
  subscribeToTypingIndicators
} from '@/services/chat';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);
  const [threadMessages, setThreadMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  // Typed debounce function
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages when room changes
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const chatMessages = await getChatMessages(currentRoomId);
        setMessages(chatMessages);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentRoomId]);

  // Subscribe to new messages and message updates
  useEffect(() => {
    if (!currentRoomId) return;
    
    // Subscribe to new messages
    const messageSubscription = subscribeToMessages(currentRoomId, (newMessage) => {
      setMessages(prevMessages => {
        // Check if the message already exists
        const exists = prevMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prevMessages;
        
        return [...prevMessages, newMessage];
      });
    });
    
    // Subscribe to message updates
    const messageUpdateSubscription = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
      
      // If there's an active thread and the updated message belongs to it
      if (activeThreadId && updatedMessage.thread_parent_id === activeThreadId) {
        setThreadMessages(prevThreadMsgs => ({
          ...prevThreadMsgs,
          [activeThreadId]: (prevThreadMsgs[activeThreadId] || []).map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        }));
      }
    });
    
    // Subscribe to typing indicators
    const typingSubscription = subscribeToTypingIndicators(currentRoomId, (indicators) => {
      // Filter out the current user
      const otherTypingUsers = indicators
        .filter(indicator => indicator.user_id !== userId)
        .map(indicator => ({ id: indicator.user_id, name: indicator.user_name }));
      
      setTypingUsers(otherTypingUsers);
    });
    
    // Cleanup subscriptions
    return () => {
      messageSubscription();
      messageUpdateSubscription();
      typingSubscription();
    };
  }, [currentRoomId, userId, activeThreadId]);

  // Send typing indicator
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId || !userName) return;
    
    setIsTyping(true);
    
    // Send typing indicator to server
    setTypingIndicator(currentRoomId, userId, userName);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      clearTypingIndicator(currentRoomId, userId);
    }, 3000);
  }, [currentRoomId, userId, userName]);

  // Send a new message
  const handleSendMessage = useCallback(async (threadParentId?: string): Promise<void> => {
    if (!newMessageText.trim() || !currentRoomId || !userId) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText.trim(),
        thread_parent_id: threadParentId
      };
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        await clearTypingIndicator(currentRoomId, userId);
      }
      
      // If it's a thread reply, send it as a thread reply
      if (threadParentId) {
        await sendThreadReply(messageParams);
      } else {
        await sendChatMessage(messageParams);
      }
      
      setNewMessageText('');
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    }
  }, [newMessageText, currentRoomId, userId, userName, typingTimeoutRef]);

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string): Promise<void> => {
    if (!currentRoomId || !userId) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `audio:${audioUrl}`,
        message_type: 'audio' as const,
        file_url: audioUrl,
        thread_parent_id: threadParentId
      };
      
      // If it's a thread reply, send it as a thread reply
      if (threadParentId) {
        await sendThreadReply(messageParams);
      } else {
        await sendChatMessage(messageParams);
      }
    } catch (err) {
      console.error("Failed to send voice message:", err);
      setError("Failed to send voice message");
    }
  }, [currentRoomId, userId, userName]);

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string): Promise<void> => {
    if (!currentRoomId || !userId) return;
    
    try {
      // Determine file type from extension
      const fileType = fileUrl.toLowerCase().includes('.jpg') || fileUrl.toLowerCase().includes('.png') || fileUrl.toLowerCase().includes('.jpeg') || fileUrl.toLowerCase().includes('.gif')
        ? 'image'
        : fileUrl.toLowerCase().includes('.mp4') || fileUrl.toLowerCase().includes('.webm') || fileUrl.toLowerCase().includes('.avi')
        ? 'video'
        : 'file';
      
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `${fileType}:${fileUrl}`,
        message_type: fileType as 'image' | 'video' | 'file',
        file_url: fileUrl,
        thread_parent_id: threadParentId
      };
      
      // If it's a thread reply, send it as a thread reply
      if (threadParentId) {
        await sendThreadReply(messageParams);
      } else {
        await sendChatMessage(messageParams);
      }
    } catch (err) {
      console.error("Failed to send file message:", err);
      setError("Failed to send file message");
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message for review
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagMsg({
        messageId,
        reason
      });
    } catch (err) {
      console.error("Failed to flag message:", err);
      setError("Failed to flag message");
    }
  }, []);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    try {
      await editMessage({
        messageId,
        content,
        userId
      });
    } catch (err) {
      console.error("Failed to edit message:", err);
      setError("Failed to edit message");
      throw err;
    }
  }, [userId]);

  // Fetch thread replies
  const fetchThreadReplies = useCallback(async (parentMessageId: string) => {
    try {
      const replies = await getThreadReplies(parentMessageId);
      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: replies
      }));
      return replies;
    } catch (err) {
      console.error("Failed to fetch thread replies:", err);
      setError("Failed to fetch thread replies");
      return [];
    }
  }, []);

  // Open a thread
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    await fetchThreadReplies(messageId);
  }, [fetchThreadReplies]);

  // Close the thread
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
