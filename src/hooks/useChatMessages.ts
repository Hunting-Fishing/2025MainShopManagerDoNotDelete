import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getChatMessages, 
  sendChatMessage, 
  editChatMessage, 
  flagChatMessage,
  getThreadReplies,
  subscribeToMessages,
  clearTypingIndicator
} from '@/services/chat';
import { ChatMessage } from '@/types/chat';
import { MessageSendParams } from '@/services/chat/message/types';
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
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages for the current room
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      const loadedMessages = await getChatMessages(roomId);
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
      toast({
        title: "Error",
        description: "Couldn't load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    if (!currentRoomId) return;
    
    loadMessages(currentRoomId);
    
    const unsubscribe = subscribeToMessages(currentRoomId, (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentRoomId, userId, loadMessages]);

  // Handle typing indicator
  useEffect(() => {
    if (!currentRoomId) return;

    const handleTypingStart = () => {
      setIsTyping(true);
      setTypingUsers([{ id: userId, name: userName }]);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUsers([]);
      }, 3000);
    };

    const handleTypingEnd = () => {
      setIsTyping(false);
      setTypingUsers([]);
    };

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentRoomId, isTyping, userId, userName]);

  // Send a new message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim() || !userId) return;

    try {
      const params: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText.trim(),
        message_type: 'text',
        thread_parent_id: threadParentId || undefined
      };

      await sendChatMessage(params);
      setNewMessageText('');
      
      // Clear typing indicator if active
      if (isTyping) {
        clearTypingIndicator(currentRoomId, userId);
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [currentRoomId, userId, userName, newMessageText, isTyping]);

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) return;
    
    try {
      const params: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: audioUrl,
        message_type: 'audio',
        thread_parent_id: threadParentId || undefined
      };
      
      await sendChatMessage(params);
    } catch (error) {
      console.error("Failed to send voice message:", error);
      toast({
        title: 'Error',
        description: 'Failed to send voice message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [currentRoomId, userId, userName]);

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId || !userId) return;
    
    try {
      // Determine file type from URL
      let messageType = 'file';
      if (fileUrl.includes(':')) {
        const [type] = fileUrl.split(':');
        if (['image', 'audio', 'video', 'file'].includes(type)) {
          messageType = type;
        }
      }
      
      const params: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: fileUrl,
        message_type: messageType as any,
        thread_parent_id: threadParentId || undefined
      };
      
      await sendChatMessage(params);
    } catch (error) {
      console.error("Failed to send file message:", error);
      toast({
        title: 'Error',
        description: 'Failed to send file. Please try again.',
        variant: 'destructive',
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage({ messageId, reason });
      
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

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!userId) return;
    
    try {
      await editChatMessage({ messageId, content, userId });
      
      // Optimistically update the message in the local state
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

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!userId || !currentRoomId) return;
    
    setIsTyping(true);
  }, [userId, currentRoomId]);

  // Open a thread
  const handleThreadOpen = useCallback(async (messageId: string) => {
    setActiveThreadId(messageId);
    fetchThreadReplies(messageId);
  }, []);

  // Close a thread
  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  // Fetch thread replies
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
