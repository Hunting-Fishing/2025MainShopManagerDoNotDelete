
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import {
  getChatMessages,
  getThreadMessages,
  sendChatMessage,
  flagChatMessage,
  editChatMessage,
  setTypingIndicator,
  clearTypingIndicator,
  subscribeToTypingIndicators,
  sendThreadReply,
  TypingIndicator,
  subscribeToMessages,
  subscribeToMessageUpdates
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  
  // Thread management
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  // Typing indicators
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load chat messages when room changes
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      setLoading(true);
      try {
        const fetchedMessages = await getChatMessages({
          roomId: currentRoomId
        });
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, [currentRoomId]);
  
  // Subscribe to new messages in the current room
  useEffect(() => {
    if (!currentRoomId) return;
    
    // Subscribe to new messages
    const unsubscribeNewMessages = subscribeToMessages(
      currentRoomId,
      (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    );
    
    // Subscribe to message updates (e.g. read status, flags)
    const unsubscribeMessageUpdates = subscribeToMessageUpdates(
      currentRoomId,
      (updatedMessage) => {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    );
    
    return () => {
      unsubscribeNewMessages();
      unsubscribeMessageUpdates();
    };
  }, [currentRoomId]);
  
  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId || !userId) return;
    
    // Clear typing status when component unmounts or room changes
    return () => {
      if (currentRoomId && userId) {
        clearTypingIndicator(currentRoomId, userId);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentRoomId, userId]);
  
  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId) return;
    
    const handleTypingIndicators = (indicators: TypingIndicator[]) => {
      // Filter out current user and create a simple array of users who are typing
      const typingUsersList = indicators
        .filter(ind => ind.user_id !== userId)
        .map(ind => ({
          id: ind.user_id,
          name: ind.user_name
        }));
      
      setTypingUsers(typingUsersList);
    };
    
    const unsubscribe = subscribeToTypingIndicators(currentRoomId, handleTypingIndicators);
    
    return () => {
      unsubscribe();
    };
  }, [currentRoomId, userId]);
  
  // Send a new chat message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !userId || !newMessageText.trim()) {
      return;
    }
    
    try {
      // If replying in a thread
      if (threadParentId) {
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText,
          thread_parent_id: threadParentId
        });
        
        // Refresh thread messages
        fetchThreadReplies(threadParentId);
      } else {
        // Regular message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText
        });
      }
      
      setNewMessageText('');
      // Clear typing indicator
      if (currentRoomId && userId) {
        clearTypingIndicator(currentRoomId, userId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  }, [currentRoomId, userId, userName, newMessageText]);
  
  // Flag a message for review
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    if (!messageId || !reason) return;
    
    try {
      await flagChatMessage({
        messageId,
        reason
      });
    } catch (error) {
      console.error('Error flagging message:', error);
      setError('Failed to flag message');
    }
  }, []);
  
  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!messageId || !content || !userId) return;
    
    try {
      await editChatMessage({
        messageId,
        content,
        userId
      });
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message');
    }
  }, [userId]);
  
  // Send file message (audio, image, document)
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !fileUrl) {
      return;
    }
    
    try {
      // Determine message type from file URL
      const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
      let messageType: 'audio' | 'image' | 'video' | 'file' = 'file';
      
      if (['mp3', 'wav', 'ogg'].includes(fileExtension || '')) {
        messageType = 'audio';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
        messageType = 'image';
      } else if (['mp4', 'webm', 'mov'].includes(fileExtension || '')) {
        messageType = 'video';
      }
      
      // If replying in a thread
      if (threadParentId) {
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: fileUrl,
          message_type: messageType,
          file_url: fileUrl,
          thread_parent_id: threadParentId
        });
        
        fetchThreadReplies(threadParentId);
      } else {
        // Regular file message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: fileUrl,
          message_type: messageType,
          file_url: fileUrl
        });
      }
    } catch (error) {
      console.error('Error sending file message:', error);
      setError('Failed to send file');
    }
  }, [currentRoomId, userId, userName]);
  
  // Send voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    await handleSendFileMessage(audioUrl, threadParentId);
  }, [handleSendFileMessage]);
  
  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId || !userName) return;
    
    setIsTyping(true);
    
    // Set typing indicator
    setTypingIndicator(currentRoomId, userId, userName);
    
    // Clear previous timeout if exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear typing indicator after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      clearTypingIndicator(currentRoomId, userId);
    }, 3000);
  }, [currentRoomId, userId, userName]);
  
  // Thread management
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    await fetchThreadReplies(messageId);
  }, []);
  
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);
  
  // Fetch thread replies
  const fetchThreadReplies = useCallback(async (parentId: string) => {
    if (!parentId) return;
    
    try {
      const replies = await getThreadMessages({ parentId });
      setThreadMessages(prev => ({
        ...prev,
        [parentId]: replies
      }));
    } catch (error) {
      console.error('Error fetching thread replies:', error);
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
    fetchThreadReplies
  };
};
