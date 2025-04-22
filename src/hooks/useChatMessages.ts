
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export interface TypingUser {
  id: string;
  name: string;
}

export const useChatMessages = ({ 
  userId, 
  userName, 
  currentRoomId 
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages for the current room
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Simulate fetching messages
        // In a real app, this would be a call to an API or database
        const mockMessages: ChatMessage[] = [];
        setMessages(mockMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentRoomId]);

  const handleSendMessage = useCallback(
    async (threadParentId?: string) => {
      if (!currentRoomId || !newMessageText.trim()) return;

      try {
        // Simulate sending a message
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText,
          created_at: new Date().toISOString(),
          is_read: true,
          thread_parent_id: threadParentId || undefined,
          message_type: 'text',
        };

        if (threadParentId) {
          // Add to thread messages
          setThreadMessages((prev) => [...prev, newMessage]);
        } else {
          // Add to main messages
          setMessages((prev) => [...prev, newMessage]);
        }

        setNewMessageText('');
      } catch (err) {
        console.error('Error sending message:', err);
      }
    },
    [currentRoomId, newMessageText, userId, userName]
  );

  const handleSendVoiceMessage = useCallback(
    async (audioUrl: string, threadParentId?: string) => {
      if (!currentRoomId || !audioUrl) return;

      try {
        // Simulate sending a voice message
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: 'Audio message',
          created_at: new Date().toISOString(),
          is_read: true,
          file_url: audioUrl,
          message_type: 'audio',
          thread_parent_id: threadParentId || undefined,
        };

        if (threadParentId) {
          // Add to thread messages
          setThreadMessages((prev) => [...prev, newMessage]);
        } else {
          // Add to main messages
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (err) {
        console.error('Error sending voice message:', err);
      }
    },
    [currentRoomId, userId, userName]
  );

  const handleSendFileMessage = useCallback(
    async (fileUrl: string, threadParentId?: string) => {
      if (!currentRoomId || !fileUrl) return;

      try {
        // Simulate sending a file message
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: 'File attachment',
          created_at: new Date().toISOString(),
          is_read: true,
          file_url: fileUrl,
          message_type: 'file',
          thread_parent_id: threadParentId || undefined,
        };

        if (threadParentId) {
          // Add to thread messages
          setThreadMessages((prev) => [...prev, newMessage]);
        } else {
          // Add to main messages
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (err) {
        console.error('Error sending file message:', err);
      }
    },
    [currentRoomId, userId, userName]
  );

  const flagMessage = useCallback(
    (messageId: string, reason: string) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, is_flagged: Boolean(reason), flag_reason: reason } : msg
        )
      );

      // Also update thread messages if applicable
      setThreadMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, is_flagged: Boolean(reason), flag_reason: reason } : msg
        )
      );
    },
    []
  );

  const handleEditMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!content.trim()) return;

      try {
        // Update in main messages
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content,
                  is_edited: true,
                  edited_at: new Date().toISOString(),
                }
              : msg
          )
        );

        // Also update thread messages if applicable
        setThreadMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content,
                  is_edited: true,
                  edited_at: new Date().toISOString(),
                }
              : msg
          )
        );

        return Promise.resolve();
      } catch (err) {
        console.error('Error editing message:', err);
        return Promise.reject(err);
      }
    },
    []
  );

  const handleTyping = useCallback(() => {
    if (!currentRoomId) return;
    
    // Simulate typing notification
    setIsTyping(true);
    
    // Clear typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [currentRoomId]);

  const handleThreadOpen = useCallback(
    (messageId: string) => {
      setActiveThreadId(messageId);
      
      // Simulate fetching thread messages
      // In a real app, this would be a call to an API or database
      const mockThreadMessages: ChatMessage[] = [];
      setThreadMessages(mockThreadMessages);
    },
    []
  );

  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
    setThreadMessages([]);
  }, []);

  const getThreadReplies = useCallback(async (threadId: string) => {
    try {
      // Simulate fetching thread replies
      // In a real app, this would be a call to an API or database
      const mockThreadReplies: ChatMessage[] = [];
      return mockThreadReplies;
    } catch (err) {
      console.error('Error fetching thread replies:', err);
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
  };
};
