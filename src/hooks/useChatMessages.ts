
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendChatMessage, 
  flagChatMessage, 
  editChatMessage, 
  getThreadMessages
} from '@/services/chat';
import { supabase } from '@/integrations/supabase/client';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages for the current room
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoomId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
        setError('');
      } catch (err) {
        console.error('Failed to fetch messages:', err);
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

    // Set up subscription for new messages
    const channel = supabase
      .channel(`room-${currentRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, payload => {
        const newMessage = payload.new as ChatMessage;
        
        // Only add to messages if not already there
        setMessages(prevMessages => {
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, payload => {
        const updatedMessage = payload.new as ChatMessage;
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );

        // Also update in thread messages if present
        if (updatedMessage.thread_parent_id && threadMessages[updatedMessage.thread_parent_id]) {
          setThreadMessages(prev => ({
            ...prev,
            [updatedMessage.thread_parent_id!]: prev[updatedMessage.thread_parent_id!].map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId, threadMessages]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId) return;

    const typingChannel = supabase
      .channel(`typing-${currentRoomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `room_id=eq.${currentRoomId}`
      }, () => {
        // Just trigger a refresh of typing indicators
        refreshTypingUsers();
      })
      .subscribe();

    const refreshTypingUsers = async () => {
      if (!currentRoomId) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_typing_indicators')
          .select('user_id, user_name')
          .eq('room_id', currentRoomId)
          .neq('user_id', userId);
          
        if (error) throw error;
        
        // Filter out our own typing indicator
        const otherUsers = data as {user_id: string, user_name: string}[];
        setTypingUsers(otherUsers);
      } catch (err) {
        console.error('Error fetching typing indicators:', err);
      }
    };

    // Initial fetch of typing users
    refreshTypingUsers();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [currentRoomId, userId]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId) return;
    
    setIsTyping(true);
    
    const updateTypingStatus = async () => {
      try {
        const { error } = await supabase
          .from('chat_typing_indicators')
          .upsert({
            room_id: currentRoomId,
            user_id: userId,
            user_name: userName,
            started_at: new Date().toISOString()
          });
          
        if (error) throw error;
      } catch (err) {
        console.error('Error updating typing status:', err);
      }
    };
    
    // Update typing status
    updateTypingStatus();
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to remove typing indicator
    const newTimeout = setTimeout(async () => {
      setIsTyping(false);
      
      try {
        const { error } = await supabase
          .from('chat_typing_indicators')
          .delete()
          .eq('user_id', userId)
          .eq('room_id', currentRoomId);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error removing typing indicator:', err);
      }
    }, 3000);
    
    setTypingTimeout(newTimeout as unknown as NodeJS.Timeout);
  }, [currentRoomId, userId, userName, typingTimeout]);

  // Send a message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !userId || !newMessageText.trim()) {
      return;
    }

    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: newMessageText,
        threadParentId: threadParentId
      });
      
      setNewMessageText('');
      
      // If this was a thread reply, update thread messages
      if (threadParentId && threadMessages[threadParentId]) {
        await getThreadReplies(threadParentId);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  }, [currentRoomId, userId, userName, newMessageText, threadMessages]);

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) {
      return;
    }

    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: audioUrl,
        messageType: 'audio',
        threadParentId: threadParentId
      });
      
      // If this was a thread reply, update thread messages
      if (threadParentId && threadMessages[threadParentId]) {
        await getThreadReplies(threadParentId);
      }
    } catch (err) {
      console.error('Failed to send audio message:', err);
      setError('Failed to send audio message');
    }
  }, [currentRoomId, userId, userName, threadMessages]);

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) {
      return;
    }

    try {
      const fileType = fileUrl.split(':')[0];
      
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: fileUrl,
        messageType: fileType as 'image' | 'video' | 'audio' | 'file',
        threadParentId: threadParentId
      });
      
      // If this was a thread reply, update thread messages
      if (threadParentId && threadMessages[threadParentId]) {
        await getThreadReplies(threadParentId);
      }
    } catch (err) {
      console.error('Failed to send file message:', err);
      setError('Failed to send file message');
    }
  }, [currentRoomId, userId, userName, threadMessages]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
    } catch (err) {
      console.error('Failed to flag message:', err);
      setError('Failed to flag message');
    }
  }, []);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await editChatMessage(messageId, content);
    } catch (err) {
      console.error('Failed to edit message:', err);
      setError('Failed to edit message');
    }
  }, []);

  // Get thread replies
  const getThreadReplies = useCallback(async (messageId: string) => {
    if (!currentRoomId) return;
    
    try {
      const replies = await getThreadMessages(messageId);
      
      setThreadMessages(prev => ({
        ...prev,
        [messageId]: replies
      }));
      
      return replies;
    } catch (err) {
      console.error('Failed to load thread replies:', err);
      setError('Failed to load thread replies');
      return [];
    }
  }, [currentRoomId]);

  // Handle thread open
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    await getThreadReplies(messageId);
  }, [getThreadReplies]);

  // Handle thread close
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
    getThreadReplies
  };
};
