
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

interface TypingUser {
  user_id: string;
  user_name: string;
  last_typed: number;
}

export const useChatMessages = ({
  userId,
  userName,
  currentRoomId
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  
  // For threads
  const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!currentRoomId) return;
    
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', currentRoomId)
        .is('thread_parent_id', null) // Only get top-level messages
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (fetchError) throw fetchError;
      
      setMessages(data || []);
      
      // Mark messages as read
      if (data && data.length > 0) {
        const unreadMessages = data.filter(m => !m.is_read && m.sender_id !== userId);
        if (unreadMessages.length > 0) {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(m => m.id));
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [currentRoomId, userId]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !userId || !newMessageText.trim()) return;
    
    try {
      const messageData = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
        thread_parent_id: threadParentId || null
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select();
      
      if (error) throw error;
      
      // Update thread count for parent message
      if (threadParentId) {
        const { data: parentMessage } = await supabase
          .from('chat_messages')
          .select('thread_count')
          .eq('id', threadParentId)
          .single();
        
        const currentCount = parentMessage?.thread_count || 0;
        await supabase
          .from('chat_messages')
          .update({ thread_count: currentCount + 1 })
          .eq('id', threadParentId);
      }
      
      setNewMessageText('');
      
      // If it's a thread message, update the thread messages
      if (threadParentId) {
        getThreadReplies(threadParentId);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [currentRoomId, userId, userName, newMessageText]);

  // Handle sending voice messages
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !audioUrl) return;
    
    try {
      const messageData = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: 'Sent a voice message',
        created_at: new Date().toISOString(),
        is_read: false,
        message_type: 'audio',
        file_url: `audio:${audioUrl}`,
        thread_parent_id: threadParentId || null
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select();
        
      if (error) throw error;
      
      // Update thread count for parent message
      if (threadParentId) {
        const { data: parentMessage } = await supabase
          .from('chat_messages')
          .select('thread_count')
          .eq('id', threadParentId)
          .single();
        
        const currentCount = parentMessage?.thread_count || 0;
        await supabase
          .from('chat_messages')
          .update({ thread_count: currentCount + 1 })
          .eq('id', threadParentId);
          
        getThreadReplies(threadParentId);
      }
    } catch (err) {
      console.error('Failed to send voice message:', err);
      toast({
        title: "Failed to send voice message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [currentRoomId, userId, userName]);

  // Handle sending file messages
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !fileUrl) return;
    
    try {
      // Extract file type from URL format (type:actualUrl)
      const type = fileUrl.split(':')[0];
      
      const messageData = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: `Shared a ${type} file`,
        created_at: new Date().toISOString(),
        is_read: false,
        message_type: type,
        file_url: fileUrl,
        thread_parent_id: threadParentId || null
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select();
        
      if (error) throw error;
      
      // Update thread count for parent message
      if (threadParentId) {
        const { data: parentMessage } = await supabase
          .from('chat_messages')
          .select('thread_count')
          .eq('id', threadParentId)
          .single();
        
        const currentCount = parentMessage?.thread_count || 0;
        await supabase
          .from('chat_messages')
          .update({ thread_count: currentCount + 1 })
          .eq('id', threadParentId);
          
        getThreadReplies(threadParentId);
      }
    } catch (err) {
      console.error('Failed to send file message:', err);
      toast({
        title: "Failed to send file",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, isFlagged: boolean) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_flagged: isFlagged })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_flagged: isFlagged } : msg
      ));
      
      toast({
        title: isFlagged ? "Message flagged" : "Flag removed",
        description: isFlagged 
          ? "The message has been flagged for review" 
          : "The flag has been removed from this message",
        variant: isFlagged ? "destructive" : "default"
      });
    } catch (err) {
      console.error('Failed to flag message:', err);
      toast({
        title: "Action failed",
        description: "Failed to update message flag status",
        variant: "destructive"
      });
    }
  }, []);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          content: newContent, 
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: newContent, 
              is_edited: true,
              edited_at: new Date().toISOString()
            } 
          : msg
      ));
    } catch (err) {
      console.error('Failed to edit message:', err);
      toast({
        title: "Edit failed",
        description: "Failed to update message content",
        variant: "destructive"
      });
    }
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId) return;
    setIsTyping(true);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, user_name: userName }
      });
    }
    
    // Clear previous timeout if exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stop_typing',
          payload: { user_id: userId, user_name: userName }
        });
      }
    }, 2000);
  }, [currentRoomId, userId, userName]);

  // Thread functionality
  const handleThreadOpen = useCallback(async (parentMessageId: string) => {
    setActiveThreadId(parentMessageId);
    getThreadReplies(parentMessageId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  const getThreadReplies = useCallback(async (parentMessageId: string) => {
    if (!parentMessageId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_parent_id', parentMessageId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: data || []
      }));
    } catch (err) {
      console.error('Failed to fetch thread replies:', err);
      toast({
        title: "Error",
        description: "Failed to load replies",
        variant: "destructive"
      });
    }
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!currentRoomId || !userId) return;
    
    // Subscribe to messages for current room
    const messageChannel = supabase
      .channel(`room-messages-${currentRoomId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        
        if (payload.eventType === 'INSERT') {
          // If it's a new thread message
          if (newMessage.thread_parent_id) {
            if (newMessage.thread_parent_id === activeThreadId) {
              setThreadMessages(prev => {
                const currentThread = prev[newMessage.thread_parent_id || ''] || [];
                return {
                  ...prev,
                  [newMessage.thread_parent_id]: [...currentThread, newMessage]
                };
              });
            }
            // Only update thread count on main messages list
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.thread_parent_id 
                ? { ...msg, thread_count: (msg.thread_count || 0) + 1 } 
                : msg
            ));
          } else {
            // New top-level message
            if (newMessage.sender_id !== userId) {
              setMessages(prev => [...prev, newMessage]);
              
              // Mark as read if we're in the room
              supabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('id', newMessage.id)
                .then();
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          // Update a message
          if (newMessage.thread_parent_id) {
            // Update in thread
            if (newMessage.thread_parent_id === activeThreadId) {
              setThreadMessages(prev => {
                const currentThread = prev[newMessage.thread_parent_id || ''] || [];
                return {
                  ...prev,
                  [newMessage.thread_parent_id]: currentThread.map(msg => 
                    msg.id === newMessage.id ? newMessage : msg
                  )
                };
              });
            }
          } else {
            // Update in main messages list
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id ? newMessage : msg
            ));
          }
        }
      })
      .subscribe();
    
    // Setup typing indicator channel for realtime updates
    const typingChannel = supabase.channel(`room-typing-${currentRoomId}`);
    channelRef.current = typingChannel;
    
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const typingUser = payload as { user_id: string, user_name: string };
        
        if (typingUser.user_id !== userId) {
          setTypingUsers(prev => {
            const existingIndex = prev.findIndex(u => u.user_id === typingUser.user_id);
            if (existingIndex >= 0) {
              return prev.map(u => 
                u.user_id === typingUser.user_id 
                  ? { ...u, last_typed: Date.now() } 
                  : u
              );
            } else {
              return [...prev, { ...typingUser, last_typed: Date.now() }];
            }
          });
          
          // Auto-expire typing indicator after 3 seconds of no updates
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => 
              u.user_id !== typingUser.user_id || 
              Date.now() - u.last_typed < 3000
            ));
          }, 3000);
        }
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        const typingUser = payload as { user_id: string };
        
        if (typingUser.user_id !== userId) {
          setTypingUsers(prev => 
            prev.filter(u => u.user_id !== typingUser.user_id)
          );
        }
      })
      .subscribe();

    fetchMessages();
    
    return () => {
      messageChannel.unsubscribe();
      typingChannel.unsubscribe();
      channelRef.current = null;
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentRoomId, userId, activeThreadId, fetchMessages]);

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
