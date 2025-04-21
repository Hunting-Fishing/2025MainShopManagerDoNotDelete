
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendChatMessage, 
  editChatMessage,
  flagChatMessage, 
  getThreadMessages
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [typingChannel, setTypingChannel] = useState<any>(null);
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
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        console.error('Failed to load chat messages:', err);
        setError('Failed to load messages. Please try again.');
        toast({
          title: "Error",
          description: "Could not load chat messages.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentRoomId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!currentRoomId) return;

    const channel = supabase
      .channel(`chat-room:${currentRoomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as ChatMessage;
          // Don't add if it's a thread message and we're not in that thread
          if (newMessage.thread_parent_id && newMessage.thread_parent_id !== activeThreadId) {
            // Update the thread count on the parent message instead
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === newMessage.thread_parent_id 
                  ? { ...msg, thread_count: (msg.thread_count || 0) + 1 } 
                  : msg
              )
            );
            return;
          }

          // Add to messages if it's not a thread reply or it's in our active thread
          if (!newMessage.thread_parent_id || newMessage.thread_parent_id === activeThreadId) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
          }
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as ChatMessage;
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
          
          // Also update in thread messages if applicable
          if (threadMessages[updatedMessage.thread_parent_id || '']) {
            setThreadMessages(prev => ({
              ...prev,
              [updatedMessage.thread_parent_id || '']: prev[updatedMessage.thread_parent_id || ''].map(
                msg => msg.id === updatedMessage.id ? updatedMessage : msg
              )
            }));
          }
        }
      })
      .subscribe();

    // Set up typing indicators channel
    const typingIndicatorChannel = supabase
      .channel(`typing:${currentRoomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingIndicatorChannel.presenceState();
        const typingUsersList = Object.values(state).flat() as { user_id: string, user_name: string }[];
        
        // Transform the data to match the expected format
        const formattedTypingUsers = typingUsersList.map(user => ({
          id: user.user_id,
          name: user.user_name
        }));
        
        setTypingUsers(formattedTypingUsers.filter(user => user.id !== userId));
      })
      .subscribe();

    setTypingChannel(typingIndicatorChannel);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingIndicatorChannel);
    };
  }, [currentRoomId, activeThreadId, userId, threadMessages]);

  // Send message function
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: newMessageText,
        threadParentId: threadParentId
      });
      
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName, newMessageText]);

  // Send voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: `Shared an audio recording`,
        messageType: 'audio',
        threadParentId,
        file_url: audioUrl
      });
    } catch (err) {
      console.error('Failed to send voice message:', err);
      toast({
        title: "Error",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Send file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    const fileType = fileUrl.split(':')[0];
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: `Shared a ${fileType} file`,
        messageType: fileType as 'image' | 'video' | 'audio' | 'file' | 'system',
        threadParentId,
        file_url: fileUrl
      });
    } catch (err) {
      console.error('Failed to send file message:', err);
      toast({
        title: "Error",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const handleFlagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
      toast({
        title: "Message flagged",
        description: "The message has been flagged for review.",
      });
    } catch (err) {
      console.error('Failed to flag message:', err);
      toast({
        title: "Error",
        description: "Failed to flag message. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await editChatMessage(messageId, newContent);
      toast({
        title: "Message edited",
        description: "Your message has been updated.",
      });
    } catch (err) {
      console.error('Failed to edit message:', err);
      toast({
        title: "Error",
        description: "Failed to edit message. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!typingChannel || !currentRoomId) return;
    
    setIsTyping(true);
    
    // Send typing status to the channel
    typingChannel.track({
      user_id: userId,
      user_name: userName
    });
    
    // Clear existing timeout if any
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set a new timeout to clear the typing status
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    setTypingTimeout(timeout);
  }, [currentRoomId, typingChannel, userId, userName, typingTimeout]);

  // Handle thread opening
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    
    // Fetch thread messages if not already loaded
    if (!threadMessages[messageId]) {
      try {
        const replies = await getThreadMessages(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: replies
        }));
      } catch (err) {
        console.error('Failed to fetch thread replies:', err);
        toast({
          title: "Error",
          description: "Failed to load thread messages. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [threadMessages]);

  // Handle thread closing
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Fetch thread replies on demand
  const getThreadReplies = useCallback(async (messageId: string) => {
    try {
      const replies = await getThreadMessages(messageId);
      setThreadMessages(prev => ({
        ...prev,
        [messageId]: replies
      }));
      return replies;
    } catch (err) {
      console.error('Failed to fetch thread replies:', err);
      toast({
        title: "Error",
        description: "Failed to load thread replies. Please try again.",
        variant: "destructive",
      });
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
    flagMessage: handleFlagMessage,
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
