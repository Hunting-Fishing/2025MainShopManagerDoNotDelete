import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendMessage,
  flagMessage as flagMessageService,
  editMessage,
  getThreadReplies,
  sendThreadReply,
  MessageSendParams,
  clearTypingIndicator
} from '@/services/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Could not load messages');
        toast({
          title: 'Error',
          description: 'Could not load chat messages',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    const messageSubscription = supabase
      .channel(`room_${currentRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        
        if (newMessage.thread_parent_id) {
          setThreadMessages(prev => {
            const parentId = newMessage.thread_parent_id as string;
            const parentMessages = prev[parentId] || [];
            
            if (!parentMessages.find(m => m.id === newMessage.id)) {
              setMessages(prevMessages => 
                prevMessages.map(m => 
                  m.id === parentId
                    ? { ...m, thread_count: (m.thread_count || 0) + 1 }
                    : m
                )
              );
              
              return {
                ...prev,
                [parentId]: [...parentMessages, newMessage]
              };
            }
            return prev;
          });
        } else {
          setMessages(prev => {
            if (!prev.find(m => m.id === newMessage.id)) {
              return [...prev, newMessage];
            }
            return prev;
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const updatedMessage = payload.new as ChatMessage;
        
        setMessages(prev => 
          prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
        );
        
        if (updatedMessage.thread_parent_id) {
          setThreadMessages(prev => {
            const parentId = updatedMessage.thread_parent_id as string;
            const parentMessages = prev[parentId] || [];
            
            return {
              ...prev,
              [parentId]: parentMessages.map(m => 
                m.id === updatedMessage.id ? updatedMessage : m
              )
            };
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [currentRoomId, toast]);

  useEffect(() => {
    if (!currentRoomId) {
      setTypingUsers([]);
      return;
    }
    
    const typingChannel = supabase
      .channel(`typing_${currentRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const typingUser = payload.new as any;
        
        if (typingUser.user_id === userId) return;
        
        setTypingUsers(prev => {
          if (!prev.find(u => u.id === typingUser.user_id)) {
            return [...prev, { 
              id: typingUser.user_id, 
              name: typingUser.user_name 
            }];
          }
          return prev;
        });
        
        setTimeout(() => {
          setTypingUsers(prev => 
            prev.filter(u => u.id !== typingUser.user_id)
          );
        }, 3000);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_typing_indicators',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const typingUser = payload.old as any;
        setTypingUsers(prev => 
          prev.filter(u => u.id !== typingUser.user_id)
        );
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [currentRoomId, userId]);

  const handleSendMessage = useCallback(async (threadParentId?: string): Promise<void> => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      const messageParams: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText.trim(),
        message_type: 'text',
        thread_parent_id: threadParentId || undefined
      };
      
      await sendMessage(messageParams);
      setNewMessageText('');
      
      if (isTyping) {
        clearTypingIndicator(currentRoomId, userId);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  }, [currentRoomId, newMessageText, userId, userName, isTyping, toast]);

  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      const messageParams: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `audio:${audioUrl}`,
        message_type: 'audio',
        file_url: audioUrl,
        thread_parent_id: threadParentId || undefined
      };
      
      await sendMessage(messageParams);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send voice message',
        variant: 'destructive'
      });
    }
  }, [currentRoomId, userId, userName, toast]);

  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string): Promise<void> => {
    if (!currentRoomId) return;
    
    try {
      let fileType = 'file';
      if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) fileType = 'image';
      else if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) fileType = 'audio';
      else if (fileUrl.match(/\.(mp4|webm|mov)$/i)) fileType = 'video';
      else if (fileUrl.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) fileType = 'document';
      
      const messageParams: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `${fileType}:${fileUrl}`,
        message_type: fileType as 'image' | 'audio' | 'video' | 'file',
        file_url: fileUrl,
        thread_parent_id: threadParentId || undefined
      };
      
      await sendMessage(messageParams);
    } catch (error) {
      console.error('Failed to send file message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send file',
        variant: 'destructive'
      });
    }
  }, [currentRoomId, userId, userName, toast]);

  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagMessageService({ messageId, reason });
      
      toast({
        title: 'Message Flagged',
        description: 'The message has been flagged for review.',
      });
    } catch (error) {
      console.error("Failed to flag message:", error);
      toast({
        title: 'Error',
        description: 'Failed to flag message. Please try again.',
        variant: 'destructive',
      });
    }
  }, []);

  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!userId) return;
    
    try {
      await editMessage({ messageId, content, userId });
      
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, content: content, is_edited: true, edited_at: new Date().toISOString() } : msg
        )
      );
      
      toast({
        title: 'Message Edited',
        description: 'The message has been updated.',
      });
    } catch (error) {
      console.error("Failed to edit message:", error);
      toast({
        title: 'Error',
        description: 'Failed to edit message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [userId]);

  const handleTyping = useCallback(() => {
    if (!userId || !currentRoomId) return;
    
    setIsTyping(true);
  }, [userId, currentRoomId]);

  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    fetchThreadReplies(messageId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  const fetchThreadReplies = useCallback(async (parentId: string) => {
    try {
      const replies = await getThreadReplies(parentId);
      setThreadMessages(prev => ({ ...prev, [parentId]: replies }));
    } catch (error) {
      console.error("Failed to fetch thread replies:", error);
      toast({
        title: 'Error',
        description: 'Failed to load replies. Please try again.',
        variant: 'destructive',
      });
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
