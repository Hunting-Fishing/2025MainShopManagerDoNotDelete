
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  sendChatMessage, 
  flagChatMessage, 
  editChatMessage,
  getThreadReplies,
  subscribeToMessages,
  subscribeToMessageUpdates
} from '@/services/chat';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  
  // Thread-related state
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages for the current room
  const fetchMessages = useCallback(async () => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }
    
    try {
      setLoading(true);
      const fetchedMessages = await getChatMessages(currentRoomId);
      setMessages(fetchedMessages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to fetch messages');
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentRoomId]);

  // Fetch thread replies for a parent message
  const fetchThreadReplies = useCallback(async (messageId: string) => {
    if (!messageId) return;
    
    try {
      const replies = await getThreadReplies(messageId);
      
      setThreadMessages(prev => ({
        ...prev,
        [messageId]: replies
      }));
    } catch (err) {
      console.error('Failed to fetch thread replies:', err);
      toast({
        title: "Error",
        description: "Failed to load replies. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Handle opening a thread
  const handleThreadOpen = useCallback((messageId: string) => {
    setActiveThreadId(messageId);
    fetchThreadReplies(messageId);
  }, [fetchThreadReplies]);

  // Handle closing a thread
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Subscribe to new messages using Supabase real-time
  useEffect(() => {
    if (!currentRoomId || !userId) return;

    // Fetch initial messages
    fetchMessages();
    
    // Set up message subscription
    const unsubscribeMessages = subscribeToMessages(currentRoomId, (newMessage) => {
      // Add new message to the appropriate list (main chat or thread)
      if (newMessage.thread_parent_id) {
        setThreadMessages(prev => {
          const threadId = newMessage.thread_parent_id!;
          const currentThreadMessages = prev[threadId] || [];
          
          // Check if message already exists to prevent duplicates
          if (!currentThreadMessages.some(m => m.id === newMessage.id)) {
            return {
              ...prev,
              [threadId]: [...currentThreadMessages, newMessage]
            };
          }
          return prev;
        });
      } else {
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          if (!prevMessages.some(m => m.id === newMessage.id)) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
    });
    
    // Set up message updates subscription
    const unsubscribeUpdates = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      // Update message in the appropriate list (main chat or thread)
      if (updatedMessage.thread_parent_id) {
        setThreadMessages(prev => {
          const threadId = updatedMessage.thread_parent_id!;
          const currentThreadMessages = prev[threadId] || [];
          
          return {
            ...prev,
            [threadId]: currentThreadMessages.map(m => 
              m.id === updatedMessage.id ? updatedMessage : m
            )
          };
        });
      } else {
        setMessages(prevMessages => 
          prevMessages.map(m => 
            m.id === updatedMessage.id ? updatedMessage : m
          )
        );
      }
    });
    
    // Set up typing indicator channel
    const typingChannel = supabase
      .channel(`typing-${currentRoomId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        // Skip our own typing events
        if (payload.payload.userId === userId) return;
        
        // Update typing users list
        setTypingUsers(prev => {
          const user = {
            id: payload.payload.userId,
            name: payload.payload.userName
          };
          
          // If user is already in the list, don't add them again
          if (prev.some(u => u.id === user.id)) {
            return prev;
          }
          
          return [...prev, user];
        });
        
        // Clear typing indicator after a delay
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.id !== payload.payload.userId));
        }, 3000);
      })
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      unsubscribeMessages();
      unsubscribeUpdates();
      supabase.removeChannel(typingChannel);
      setMessages([]);
      setTypingUsers([]);
    };
  }, [currentRoomId, userId, fetchMessages]);

  // Send a chat message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !userId || !newMessageText.trim()) return;
    
    try {
      // Get thread parent from message id if provided
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText.trim(),
        message_type: 'text',
        thread_parent_id: threadParentId
      };
      
      await sendChatMessage(messageParams);
      
      // Clear input after sending
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

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !audioUrl) return;
    
    try {
      // Format voice message content (this will be parsed by the ChatFileMessage component)
      const content = `audio:${audioUrl}|Voice Message|0|audio/wav`;
      
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content,
        message_type: 'audio',
        thread_parent_id: threadParentId
      };
      
      await sendChatMessage(messageParams);
      
      toast({
        title: "Voice message sent",
        description: "Your voice message has been sent.",
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

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId || !fileUrl) return;
    
    try {
      // The fileUrl is expected to already be formatted by FileUploadButton component
      const messageParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: fileUrl,
        message_type: 'file',
        thread_parent_id: threadParentId
      };
      
      await sendChatMessage(messageParams);
      
      toast({
        title: "File sent",
        description: "Your file has been sent.",
      });
    } catch (err) {
      console.error('Failed to send file:', err);
      toast({
        title: "Error",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    if (!userId || !messageId) return;
    
    try {
      await flagChatMessage({
        messageId,
        userId,
        reason
      });
      
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
  }, [userId]);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!userId || !messageId || !content.trim()) return;
    
    try {
      await editChatMessage({
        messageId,
        userId,
        content: content.trim()
      });
      
      toast({
        title: "Message updated",
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
  }, [userId]);

  // Handle typing event
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId || isTyping) return;
    
    // Set local typing status
    setIsTyping(true);
    
    // Send typing event to channel
    const typingChannel = supabase.channel(`typing-${currentRoomId}`);
    
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId,
        userName
      }
    });
    
    // Reset typing status after delay
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [currentRoomId, userId, userName, isTyping]);

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
