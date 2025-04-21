import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  sendMessage, 
  markMessagesAsRead, 
  flagChatMessage,
  editMessage,
  subscribeToMessages,
  subscribeToMessageUpdates
} from '@/services/chat';
import { parseTaggedItems } from '@/services/chat/message/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIndicatorRef = useRef<any>(null);

  const fetchMessages = useCallback(async () => {
    if (!currentRoomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: chatMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', currentRoomId)
        .is('thread_parent_id', null)
        .order('created_at', { ascending: true });

      setMessages(chatMessages || []);
      
      if (userId) {
        await markMessagesAsRead(currentRoomId, userId);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentRoomId, userId]);

  const fetchThreadReplies = useCallback(async (parentMessageId: string) => {
    if (!parentMessageId) return;

    try {
      const { data: replies } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_parent_id', parentMessageId)
        .order('created_at', { ascending: true });

      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: replies || []
      }));

      return replies;
    } catch (err) {
      console.error('Failed to fetch thread replies:', err);
      toast({
        title: 'Error',
        description: 'Failed to load thread replies',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId || !userName) return;

    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!typingIndicatorRef.current) {
      typingIndicatorRef.current = supabase
        .from('chat_typing_indicators')
        .upsert([
          {
            user_id: userId,
            user_name: userName,
            room_id: currentRoomId
          }
        ]);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentRoomId && userId) {
        supabase
          .from('chat_typing_indicators')
          .delete()
          .match({
            user_id: userId,
            room_id: currentRoomId
          });
      }
      typingIndicatorRef.current = null;
    }, 3000);
  }, [currentRoomId, userId, userName]);

  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!newMessageText.trim() || !currentRoomId || !userId) return;

    try {
      const taggedItems = parseTaggedItems(newMessageText);
      
      await sendMessage({
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText,
        message_type: 'text',
        metadata: {
          taggedItems,
          ...(threadParentId ? { thread_parent_id: threadParentId } : {})
        }
      });

      setNewMessageText('');
      
      if (threadParentId) {
        fetchThreadReplies(threadParentId);
        
        const parentMessage = messages.find(msg => msg.id === threadParentId);
        if (parentMessage) {
          await supabase
            .from('chat_messages')
            .update({ thread_count: (parentMessage.thread_count || 0) + 1 })
            .eq('id', threadParentId);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [newMessageText, currentRoomId, userId, userName, messages, fetchThreadReplies]);

  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) return;

    try {
      await sendMessage({
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: 'Voice message',
        message_type: 'audio',
        metadata: {
          file_url: audioUrl,
          ...(threadParentId ? { thread_parent_id: threadParentId } : {})
        }
      });
      
      if (threadParentId) {
        fetchThreadReplies(threadParentId);
        
        const parentMessage = messages.find(msg => msg.id === threadParentId);
        if (parentMessage) {
          await supabase
            .from('chat_messages')
            .update({ thread_count: (parentMessage.thread_count || 0) + 1 })
            .eq('id', threadParentId);
        }
      }
    } catch (err) {
      console.error('Failed to send voice message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send voice message',
        variant: 'destructive',
      });
    }
  }, [currentRoomId, userId, userName, messages, fetchThreadReplies]);

  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) return;

    try {
      await sendMessage({
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: 'File attachment',
        message_type: 'file',
        metadata: {
          file_url: fileUrl,
          ...(threadParentId ? { thread_parent_id: threadParentId } : {})
        }
      });
      
      if (threadParentId) {
        fetchThreadReplies(threadParentId);
        
        const parentMessage = messages.find(msg => msg.id === threadParentId);
        if (parentMessage) {
          await supabase
            .from('chat_messages')
            .update({ thread_count: (parentMessage.thread_count || 0) + 1 })
            .eq('id', threadParentId);
        }
      }
    } catch (err) {
      console.error('Failed to send file:', err);
      toast({
        title: 'Error',
        description: 'Failed to send file',
        variant: 'destructive',
      });
    }
  }, [currentRoomId, userId, userName, messages, fetchThreadReplies]);

  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage({
        messageId,
        reason,
        userId
      });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_flagged: true, flag_reason: reason } 
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to flag message:', err);
      toast({
        title: 'Error',
        description: 'Failed to flag message',
        variant: 'destructive',
      });
    }
  }, [userId]);

  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      const updatedMessage = await editMessage({
        messageId,
        content,
        userId
      });
      
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updatedMessage : msg)
      );
      
      if (activeThreadId && threadMessages[activeThreadId]) {
        setThreadMessages(prev => ({
          ...prev,
          [activeThreadId]: prev[activeThreadId].map(msg =>
            msg.id === messageId ? updatedMessage : msg
          )
        }));
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
      toast({
        title: 'Error',
        description: 'Failed to edit message',
        variant: 'destructive',
      });
    }
  }, [userId, activeThreadId, threadMessages]);

  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    await fetchThreadReplies(messageId);
  }, [fetchThreadReplies]);

  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  useEffect(() => {
    if (!currentRoomId) return;
    
    const messageSubscription = subscribeToMessages(currentRoomId, (newMessage) => {
      if (!newMessage.thread_parent_id) {
        setMessages(prev => [...prev, newMessage]);
      } else if (newMessage.thread_parent_id === activeThreadId) {
        setThreadMessages(prev => ({
          ...prev,
          [activeThreadId]: [...(prev[activeThreadId] || []), newMessage]
        }));
      }
    });
    
    const messageUpdateSubscription = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages(prev => 
        prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
      );
      
      if (activeThreadId && threadMessages[activeThreadId]) {
        setThreadMessages(prev => ({
          ...prev,
          [activeThreadId]: prev[activeThreadId].map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        }));
      }
    });
    
    const typingSubscription = supabase
      .channel('typing-indicators')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const typingUser = payload.new;
        if (typingUser.user_id !== userId) {
          setTypingUsers(prev => 
            [...prev.filter(u => u.id !== typingUser.user_id), 
              { id: typingUser.user_id, name: typingUser.user_name }
            ]
          );
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const typingUser = payload.old;
        setTypingUsers(prev => 
          prev.filter(u => u.id !== typingUser.user_id)
        );
      })
      .subscribe();
    
    fetchMessages();
    
    return () => {
      messageSubscription();
      messageUpdateSubscription();
      supabase.removeChannel(typingSubscription);
    };
  }, [currentRoomId, userId, fetchMessages, activeThreadId]);
  
  useEffect(() => {
    if (!currentRoomId) return;
    
    const fetchTypingUsers = async () => {
      const { data } = await supabase
        .from('chat_typing_indicators')
        .select('*')
        .eq('room_id', currentRoomId)
        .neq('user_id', userId);
      
      if (data) {
        setTypingUsers(
          data.map(user => ({ id: user.user_id, name: user.user_name }))
        );
      }
    };
    
    fetchTypingUsers();
  }, [currentRoomId, userId]);
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      if (currentRoomId && userId) {
        supabase
          .from('chat_typing_indicators')
          .delete()
          .match({
            user_id: userId,
            room_id: currentRoomId
          });
      }
    };
  }, [currentRoomId, userId]);

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
