
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  sendChatMessage, 
  editChatMessage, 
  flagChatMessage, 
  getChatMessages, 
  getThreadReplies,
  sendThreadReply
} from '@/services/chat';
import { 
  setTypingIndicator, 
  clearTypingIndicator,
  subscribeToTypingIndicators,
  subscribeToMessages,
  subscribeToMessageUpdates,
  TypingIndicator
} from '@/services/chat/message/subscriptions';
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
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch messages for current room
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get messages for the current room
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        toast({
          title: "Error",
          description: "Could not load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentRoomId]);
  
  // Subscribe to new messages and updates
  useEffect(() => {
    if (!currentRoomId) return;
    
    // Subscribe to new messages
    const unsubscribeNewMessages = subscribeToMessages(currentRoomId, (newMessage) => {
      // Only add messages that aren't already in the list
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg.id === newMessage.id);
        if (messageExists) return prevMessages;
        return [...prevMessages, newMessage];
      });
    });
    
    // Subscribe to message updates
    const unsubscribeMessageUpdates = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    });
    
    return () => {
      unsubscribeNewMessages();
      unsubscribeMessageUpdates();
    };
  }, [currentRoomId]);
  
  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoomId) return;
    
    const unsubscribeTyping = subscribeToTypingIndicators(currentRoomId, (indicators) => {
      // Filter out current user and transform to expected format
      const activeTypers = indicators
        .filter(ind => ind.user_id !== userId)
        .map(ind => ({
          id: ind.user_id,
          name: ind.user_name
        }));
      
      setTypingUsers(activeTypers);
      setIsTyping(activeTypers.length > 0);
    });
    
    return () => {
      unsubscribeTyping();
    };
  }, [currentRoomId, userId]);
  
  // Handle user typing
  const handleTyping = useCallback(() => {
    if (!currentRoomId) return;
    
    // Update typing status
    setTypingIndicator(currentRoomId, userId, userName)
      .catch(console.error);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      clearTypingIndicator(currentRoomId, userId)
        .catch(console.error);
    }, 3000);
  }, [currentRoomId, userId, userName]);
  
  // Send a message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        clearTypingIndicator(currentRoomId, userId).catch(console.error);
      }
      
      if (threadParentId) {
        // Send as thread reply
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText,
          thread_parent_id: threadParentId
        });
        
        // Update thread messages
        fetchThreadReplies(threadParentId);
      } else {
        // Send as regular message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText
        });
      }
      
      setNewMessageText('');
    } catch (err) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName, newMessageText]);
  
  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage({
        messageId,
        reason
      });
      
      toast({
        title: "Message Flagged",
        description: "The message has been flagged for review.",
      });
    } catch (err) {
      console.error("Error flagging message:", err);
      toast({
        title: "Error",
        description: "Failed to flag message.",
        variant: "destructive",
      });
    }
  }, []);
  
  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      await editChatMessage({
        messageId,
        content,
        userId
      });
      
      toast({
        title: "Message Updated",
        description: "Your message has been edited.",
      });
    } catch (err) {
      console.error("Error editing message:", err);
      toast({
        title: "Error",
        description: "Failed to edit message.",
        variant: "destructive",
      });
    }
  }, [userId]);
  
  // Send voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      if (threadParentId) {
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: "Voice message",
          message_type: "audio",
          file_url: audioUrl,
          thread_parent_id: threadParentId
        });
        
        // Update thread messages
        fetchThreadReplies(threadParentId);
      } else {
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: "Voice message",
          message_type: "audio",
          file_url: audioUrl
        });
      }
    } catch (err) {
      console.error("Error sending voice message:", err);
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
    
    try {
      if (threadParentId) {
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: "File attachment",
          message_type: "file",
          file_url: fileUrl,
          thread_parent_id: threadParentId
        });
        
        // Update thread messages
        fetchThreadReplies(threadParentId);
      } else {
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: "File attachment",
          message_type: "file",
          file_url: fileUrl
        });
      }
    } catch (err) {
      console.error("Error sending file message:", err);
      toast({
        title: "Error",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);
  
  // Thread functions
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    fetchThreadReplies(messageId);
  }, []);
  
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);
  
  const fetchThreadReplies = useCallback(async (threadParentId: string) => {
    try {
      const replies = await getThreadReplies(threadParentId);
      setThreadMessages(prev => ({
        ...prev,
        [threadParentId]: replies
      }));
    } catch (err) {
      console.error("Error fetching thread replies:", err);
      toast({
        title: "Error",
        description: "Failed to load thread replies.",
        variant: "destructive",
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
