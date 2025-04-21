import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { getChatMessages, getThreadReplies } from '@/services/chat';
import { 
  sendChatMessage, 
  flagChatMessage, 
  editChatMessage,
  sendThreadReply
} from '@/services/chat';
import { 
  setTypingIndicator,
  subscribeToTypingIndicators 
} from '@/services/chat/message/subscriptions';

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
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages for the current room
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentRoomId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const loadedMessages = await getChatMessages(currentRoomId);
        setMessages(loadedMessages);
      } catch (e: any) {
        setError(e.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
  }, [currentRoomId]);

  // Send a new message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!newMessageText.trim() || !currentRoomId || !userId || !userName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (threadParentId) {
        // Send as a thread reply
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText,
          thread_parent_id: threadParentId
        });
      } else {
        // Send as a regular message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText
        });
      }
      
      setNewMessageText('');
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [newMessageText, currentRoomId, userId, userName]);

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !userName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (threadParentId) {
        // Send as a thread reply
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: 'Voice Message',
          message_type: 'audio',
          file_url: audioUrl,
          thread_parent_id: threadParentId
        });
      } else {
        // Send as a regular message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: 'Voice Message',
          message_type: 'audio',
          file_url: audioUrl
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send voice message');
    } finally {
      setLoading(false);
    }
  }, [currentRoomId, userId, userName]);

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !userName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (threadParentId) {
        // Send as a thread reply
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: 'File',
          message_type: 'file',
          file_url: fileUrl,
          thread_parent_id: threadParentId
        });
      } else {
        // Send as a regular message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: 'File',
          message_type: 'file',
          file_url: fileUrl
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send file message');
    } finally {
      setLoading(false);
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      await flagChatMessage({ messageId, reason, userId });
      
      // Optimistically update the message in the local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, is_flagged: true, flag_reason: reason } : msg
        )
      );
    } catch (e: any) {
      setError(e.message || 'Failed to flag message');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      await editChatMessage({ messageId, content, userId });
      
      // Optimistically update the message in the local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, content: content, is_edited: true, edited_at: new Date().toISOString() } : msg
        )
      );
    } catch (e: any) {
      setError(e.message || 'Failed to edit message');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Typing indicator
  const handleTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
    setTypingIndicator(currentRoomId || '', userId, userName, typing);

    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingIndicator(currentRoomId || '', userId, userName, false);
      }, 3000);
    }
  }, [currentRoomId, userId, userName]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId) return;

    const unsubscribe = subscribeToTypingIndicators(
      currentRoomId,
      (userId: string, userName: string, isTyping: boolean) => {
        setTypingUsers((prevUsers) => {
          if (isTyping) {
            // Add or update the typing user
            const userExists = prevUsers.some((user) => user.id === userId);
            if (!userExists) {
              return [...prevUsers, { id: userId, name: userName }];
            } else {
              return prevUsers.map(user => user.id === userId ? { id: userId, name: userName } : user);
            }
          } else {
            // Remove the user from the typing users
            return prevUsers.filter((user) => user.id !== userId);
          }
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentRoomId]);

  // Thread management
  const handleThreadOpen = useCallback((messageId: string) => {
    setActiveThreadId(messageId);
    fetchThreadReplies(messageId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Fetch thread replies
  const fetchThreadReplies = useCallback(async (parentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedReplies = await getThreadReplies(parentId);
      setThreadMessages(prevThreads => ({
        ...prevThreads,
        [parentId]: loadedReplies
      }));
    } catch (e: any) {
      setError(e.message || 'Failed to load thread replies');
    } finally {
      setLoading(false);
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
