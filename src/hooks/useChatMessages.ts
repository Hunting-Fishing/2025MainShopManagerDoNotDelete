import { useState, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!currentRoomId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', currentRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentRoomId]);

  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!newMessageText.trim() || !currentRoomId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessageText,
          sender_id: userId,
          sender_name: userName,
          room_id: currentRoomId,
          thread_parent_id: threadParentId || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [newMessageText, userId, userName, currentRoomId]);

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!currentRoomId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ content: newContent })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, content: newContent } : msg)
      );

      toast({
        title: "Message Updated",
        description: "Your message has been edited"
      });
    } catch (err) {
      console.error('Error editing message:', err);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      });
    }
  }, [currentRoomId]);

  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          is_flagged: Boolean(reason), 
          flag_reason: reason,
          flagged_by: userId 
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: reason ? "Message Flagged" : "Flag Removed",
        description: reason ? "The message has been flagged for review" : "The flag has been removed from this message"
      });
    } catch (err) {
      console.error('Error flagging message:', err);
      toast({
        title: "Error",
        description: "Failed to update message flag",
        variant: "destructive"
      });
    }
  }, [userId]);

  const handleTyping = useCallback((isCurrentlyTyping: boolean) => {
    setIsTyping(isCurrentlyTyping);
    // TODO: Implement real-time typing indicator logic
  }, []);

  const handleThreadOpen = useCallback(async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_message_threads')
        .select('*')
        .eq('parent_message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setThreadMessages(data || []);
      setActiveThreadId(messageId);
    } catch (err) {
      console.error('Error fetching thread messages:', err);
      toast({
        title: "Error",
        description: "Failed to load message thread",
        variant: "destructive"
      });
    }
  }, []);

  const handleThreadClose = useCallback(() => {
    setThreadMessages([]);
    setActiveThreadId(null);
  }, []);

  const getThreadReplies = useCallback(async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_message_threads')
        .select('*')
        .eq('parent_message_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching thread replies:', err);
      toast({
        title: "Error",
        description: "Failed to load thread replies",
        variant: "destructive"
      });
      return [];
    }
  }, []);

  const handleSendVoiceMessage = async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: 'Voice message',
          sender_id: userId,
          sender_name: userName,
          room_id: currentRoomId,
          thread_parent_id: threadParentId || null,
          created_at: new Date().toISOString(),
          message_type: 'audio',
          file_url: audioUrl
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      
      toast({
        title: "Voice Message Sent",
        description: "Your voice message has been sent successfully"
      });
    } catch (err) {
      console.error('Error sending voice message:', err);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive"
      });
    }
  };

  const handleSendFileMessage = async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          content: 'File attachment',
          sender_id: userId,
          sender_name: userName,
          room_id: currentRoomId,
          thread_parent_id: threadParentId || null,
          created_at: new Date().toISOString(),
          message_type: 'file',
          file_url: fileUrl
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      
      toast({
        title: "File Sent",
        description: "Your file has been sent successfully"
      });
    } catch (err) {
      console.error('Error sending file message:', err);
      toast({
        title: "Error",
        description: "Failed to send file",
        variant: "destructive"
      });
    }
  };

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
    getThreadReplies,
    fetchMessages
  };
};
