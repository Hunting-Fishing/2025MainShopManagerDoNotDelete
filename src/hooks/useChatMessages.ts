
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  getChatMessages, 
  sendChatMessage, 
  editChatMessage, 
  flagChatMessage,
  getThreadReplies,
  sendThreadReply,
  subscribeToMessages,
  subscribeToMessageUpdates,
  setTypingIndicator,
  clearTypingIndicator,
  subscribeToTypingIndicators,
  TypingIndicator,
  saveMessageToRecord
} from '@/services/chat';

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
  const [typingUsers, setTypingUsers] = useState<{id: string, name: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Thread support
  const [threadMessages, setThreadMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Parse mentions from message
  const parseMentionsAndReferences = (content: string) => {
    const metadata: {
      mentions?: string[],
      workOrderIds?: string[],
      partIds?: string[]
    } = {};
    
    // Parse @mentions
    const mentionPattern = /@(\w+\s\w+)/g;
    const mentions = content.match(mentionPattern);
    if (mentions) {
      metadata.mentions = mentions.map(m => m.substring(1).trim());
    }
    
    // Parse #workorders
    const workOrderPattern = /#([A-Za-z0-9\s#]+)/g;
    const workOrders = content.match(workOrderPattern);
    if (workOrders) {
      metadata.workOrderIds = workOrders.map(wo => {
        // Extract ID if present in format #name #id
        const idMatch = wo.match(/#(\d+)$/);
        return idMatch ? idMatch[1] : wo.substring(1).trim();
      });
    }
    
    // Parse $parts
    const partPattern = /\$([A-Za-z0-9\s-]+)/g;
    const parts = content.match(partPattern);
    if (parts) {
      metadata.partIds = parts.map(p => p.substring(1).trim());
    }
    
    return metadata;
  };

  // Fetch messages when the room changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentRoomId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Clear thread state when changing rooms
    setThreadMessages({});
    setActiveThreadId(null);
  }, [currentRoomId]);

  // Subscribe to message updates
  useEffect(() => {
    if (!currentRoomId) return;

    // Subscribe to new messages
    const unsubMessages = subscribeToMessages(currentRoomId, (newMessage) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      
      // If this is a reply to a thread we're viewing, update thread messages
      if (newMessage.thread_parent_id && newMessage.thread_parent_id === activeThreadId) {
        setThreadMessages(prev => ({
          ...prev,
          [activeThreadId]: [...(prev[activeThreadId] || []), newMessage]
        }));
      }
    });
    
    // Subscribe to message updates (edits, flags, etc.)
    const unsubUpdates = subscribeToMessageUpdates(currentRoomId, (updatedMessage) => {
      setMessages(prev => 
        prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
      );
      
      // If the updated message is in a thread, update thread messages too
      if (updatedMessage.thread_parent_id) {
        setThreadMessages(prev => {
          const threadId = updatedMessage.thread_parent_id!;
          if (!prev[threadId]) return prev;
          
          return {
            ...prev,
            [threadId]: prev[threadId].map(m => 
              m.id === updatedMessage.id ? updatedMessage : m
            )
          };
        });
      }
    });
    
    // Subscribe to typing indicators
    const unsubTyping = subscribeToTypingIndicators(currentRoomId, (indicators) => {
      // Filter out the current user and convert to the format we need
      const typingUsersList = indicators
        .filter(ind => ind.user_id !== userId)
        .map(ind => ({ id: ind.user_id, name: ind.user_name }));
      
      setTypingUsers(typingUsersList);
    });

    // Clean up subscriptions
    return () => {
      unsubMessages();
      unsubUpdates();
      unsubTyping();
    };
  }, [currentRoomId, userId, activeThreadId]);

  // Send a message
  const handleSendMessage = useCallback(async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;
    
    try {
      // Clear typing indicator first
      if (isTyping) {
        await clearTypingIndicator(currentRoomId, userId);
        setIsTyping(false);
      }
      
      // Parse mentions and references
      const metadata = parseMentionsAndReferences(newMessageText);
      
      if (threadParentId) {
        // Sending a thread reply
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText,
          thread_parent_id: threadParentId,
          message_type: 'text',
          metadata
        });
      } else {
        // Sending a normal message
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: newMessageText,
          message_type: 'text',
          metadata
        });
      }
      
      setNewMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName, newMessageText, isTyping]);

  // Send file message (image, audio, etc)
  const handleSendFileMessage = useCallback(async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      // Determine file type from URL
      let messageType: 'image' | 'audio' | 'video' | 'file' = 'file';
      if (fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) messageType = 'image';
      else if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) messageType = 'audio';
      else if (fileUrl.match(/\.(mp4|mov|webm)$/i)) messageType = 'video';
      
      if (threadParentId) {
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: fileUrl,
          message_type: messageType,
          file_url: fileUrl,
          thread_parent_id: threadParentId
        });
      } else {
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: fileUrl,
          message_type: messageType,
          file_url: fileUrl
        });
      }
    } catch (err) {
      console.error('Error sending file message:', err);
      toast({
        title: "Error",
        description: "Failed to send file",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Handle voice recording
  const handleSendVoiceMessage = useCallback(async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      if (threadParentId) {
        await sendThreadReply({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: audioUrl,
          message_type: 'audio',
          file_url: audioUrl,
          thread_parent_id: threadParentId
        });
      } else {
        await sendChatMessage({
          room_id: currentRoomId,
          sender_id: userId,
          sender_name: userName,
          content: audioUrl,
          message_type: 'audio',
          file_url: audioUrl
        });
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      await flagChatMessage({
        messageId,
        reason
      });
      
      toast({
        title: "Message flagged",
        description: "Thank you for reporting this message",
      });
    } catch (err) {
      console.error('Error flagging message:', err);
      toast({
        title: "Error",
        description: "Failed to flag message",
        variant: "destructive",
      });
    }
  }, []);

  // Edit a message
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await editChatMessage({
        messageId,
        content,
        userId
      });
      
      toast({
        title: "Message edited",
        description: "Your message has been updated"
      });
    } catch (err) {
      console.error('Error editing message:', err);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      });
    }
  }, [userId]);

  // Save message to work order or vehicle record
  const handleSaveMessageToRecord = useCallback(async (
    messageId: string, 
    recordType: 'work_order' | 'vehicle', 
    recordId: string
  ) => {
    try {
      await saveMessageToRecord(messageId, recordType, recordId);
      
      toast({
        title: "Message saved",
        description: `Message saved to ${recordType.replace('_', ' ')}`
      });
    } catch (err) {
      console.error('Error saving message to record:', err);
      toast({
        title: "Error",
        description: "Failed to save message to record",
        variant: "destructive",
      });
    }
  }, []);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId) return;
    
    // Debounce the typing indicator to avoid too many updates
    if (!isTyping) {
      setIsTyping(true);
      setTypingIndicator(currentRoomId, userId, userName);
    }
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set a new timeout to clear the typing indicator
    const timeout = setTimeout(async () => {
      await clearTypingIndicator(currentRoomId, userId);
      setIsTyping(false);
    }, 3000); // Clear after 3 seconds of inactivity
    
    setTypingTimeout(timeout);
  }, [currentRoomId, userId, userName, isTyping, typingTimeout]);

  // Thread management
  const handleThreadOpen = useCallback(async (messageId: string) => {
    try {
      // Fetch thread messages if we haven't already
      if (!threadMessages[messageId]) {
        const replies = await getThreadReplies(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: replies
        }));
      }
      
      setActiveThreadId(messageId);
    } catch (err) {
      console.error('Error opening thread:', err);
      toast({
        title: "Error",
        description: "Failed to load thread messages",
        variant: "destructive",
      });
    }
  }, [threadMessages]);

  const handleThreadClose = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  const fetchThreadReplies = useCallback(async (parentMessageId: string) => {
    try {
      const replies = await getThreadReplies(parentMessageId);
      setThreadMessages(prev => ({
        ...prev,
        [parentMessageId]: replies
      }));
      return replies;
    } catch (err) {
      console.error('Error fetching thread replies:', err);
      toast({
        title: "Error",
        description: "Failed to load thread messages",
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
    flagMessage,
    handleEditMessage,
    handleSaveMessageToRecord,
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
