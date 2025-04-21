
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendChatMessage, 
  flagChatMessage, 
  editChatMessage,
  getThreadReplies,
  sendThreadReply
} from '@/services/chat/message';
import { transformDatabaseMessage, clearTypingIndicator } from '@/services/chat/message/types';
import { setTypingIndicator, subscribeToMessages, subscribeToTypingIndicators } from '@/services/chat/message/subscriptions';
import { supabase } from '@/integrations/supabase/client';

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
  const [typingTimeoutId, setTypingTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [typingUsers, setTypingUsers] = useState<Array<{id: string, name: string}>>([]);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages when room changes
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentRoomId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!currentRoomId) return;

    const removeSubscription = subscribeToMessages(currentRoomId, (newMessage) => {
      // Ensure we don't duplicate messages
      setMessages(prevMessages => {
        const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
        if (messageExists) {
          return prevMessages;
        }
        
        // Skip thread replies from main messages
        if (newMessage.thread_parent_id) {
          // If we're viewing this thread, update it
          setThreadMessages(prev => {
            if (newMessage.thread_parent_id && prev[newMessage.thread_parent_id]) {
              return {
                ...prev,
                [newMessage.thread_parent_id]: [...prev[newMessage.thread_parent_id], newMessage]
              };
            }
            return prev;
          });
          return prevMessages;
        }
        
        return [...prevMessages, newMessage];
      });
    });

    return () => {
      removeSubscription();
    };
  }, [currentRoomId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId || !userId) return;

    const removeSubscription = subscribeToTypingIndicators(currentRoomId, (typingData) => {
      // Filter out current user and update the typing users list
      const otherTypingUsers = typingData
        .filter(user => user.user_id !== userId)
        .map(user => ({ id: user.user_id, name: user.user_name }));
      
      setTypingUsers(otherTypingUsers);
    });

    return () => {
      removeSubscription();
    };
  }, [currentRoomId, userId]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText.trim(),
        message_type: 'text' as const,
        thread_parent_id: threadParentId || null
      };
      
      // Clear the input field immediately for better UX
      setNewMessageText('');
      
      // Clear typing indicator
      if (typingTimeoutId) {
        clearTimeout(typingTimeoutId);
        setTypingTimeoutId(null);
      }
      await clearTypingIndicator(currentRoomId, userId);
      
      // Send either a regular message or thread reply
      if (threadParentId) {
        await sendThreadReply(messageParams);
      } else {
        await sendChatMessage(messageParams);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [currentRoomId, newMessageText, userId, userName, typingTimeoutId]);

  // Handle sending voice messages
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `audio:${audioUrl}`,
        message_type: 'audio' as const,
        file_url: audioUrl,
        thread_parent_id: threadParentId || null
      };
      
      // Send either a regular message or thread reply
      if (threadParentId) {
        await sendThreadReply(messageParams);
      } else {
        await sendChatMessage(messageParams);
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError('Failed to send voice message');
    }
  }, [currentRoomId, userId, userName]);

  // Handle file uploads
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      // Determine file type from URL
      let messageType = 'file';
      const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
      
      if (fileExtension) {
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
          messageType = 'image';
        } else if (['mp4', 'webm', 'mov'].includes(fileExtension)) {
          messageType = 'video';
        } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
          messageType = 'audio';
        }
      }
      
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `${messageType}:${fileUrl}`,
        message_type: messageType as 'text' | 'audio' | 'image' | 'video' | 'file' | 'system' | 'work_order' | 'thread',
        file_url: fileUrl,
        thread_parent_id: threadParentId || null
      };
      
      // Send either a regular message or thread reply
      if (threadParentId) {
        await sendThreadReply(messageParams);
      } else {
        await sendChatMessage(messageParams);
      }
      
      return;
    } catch (err) {
      console.error('Error sending file message:', err);
      setError('Failed to send file');
      throw err;
    }
  }, [currentRoomId, userId, userName]);
  
  // Handle flagging messages
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    if (!messageId) return;
    
    try {
      await flagChatMessage({
        messageId,
        reason
      });
    } catch (err) {
      console.error('Error flagging message:', err);
      setError('Failed to flag message');
    }
  }, []);
  
  // Handle editing messages
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!messageId || !content.trim()) return;
    
    try {
      await editChatMessage({
        messageId,
        content,
        userId
      });
    } catch (err) {
      console.error('Error editing message:', err);
      setError('Failed to edit message');
    }
  }, [userId]);
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId) return;
    
    setIsTyping(true);
    
    // Clear any existing timeout
    if (typingTimeoutId) {
      clearTimeout(typingTimeoutId);
    }
    
    // Set typing indicator in database
    setTypingIndicator(currentRoomId, userId, userName);
    
    // Set timeout to clear typing indicator after 3 seconds of inactivity
    const timeoutId = setTimeout(async () => {
      setIsTyping(false);
      await clearTypingIndicator(currentRoomId, userId);
    }, 3000);
    
    setTypingTimeoutId(timeoutId);
  }, [currentRoomId, userId, userName, typingTimeoutId]);
  
  // Handle opening a thread
  const handleThreadOpen = useCallback(async (messageId: string) => {
    try {
      // Set active thread
      setActiveThreadId(messageId);
      
      // Fetch thread replies if not already fetched
      if (!threadMessages[messageId]) {
        const replies = await getThreadReplies(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: replies
        }));
      }
    } catch (err) {
      console.error('Error opening thread:', err);
      setError('Failed to open thread');
    }
  }, [threadMessages]);
  
  // Handle closing a thread
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);
  
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
      console.error('Error fetching thread replies:', err);
      setError('Failed to fetch thread replies');
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
    fetchThreadReplies
  };
};
