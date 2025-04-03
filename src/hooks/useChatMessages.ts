
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages,
  markMessagesAsRead,
  subscribeToMessages,
  sendMessage,
  flagChatMessage
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';
import { MessageSendParams } from '@/services/chat/message/types';
import { parseFileFromMessage } from '@/services/chat/fileService';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch messages for a selected room
  const fetchMessages = useCallback(async (roomId: string) => {
    if (!roomId || !userId) return;
    
    try {
      setLoading(true);
      
      // Fetch messages for the selected room
      const fetchedMessages = await getChatMessages(roomId);
      setMessages(fetchedMessages);
      
      // Mark messages as read
      await markMessagesAsRead(roomId, userId);
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
  }, [userId]);

  // Subscribe to new messages when a room is selected
  useEffect(() => {
    if (!currentRoomId || !userId) return;

    // Initial fetch of messages
    fetchMessages(currentRoomId);

    const unsubscribe = subscribeToMessages(currentRoomId, (newMessage) => {
      setMessages(prevMessages => {
        // Check if the message is already in the list to avoid duplicates
        const isDuplicate = prevMessages.some(msg => msg.id === newMessage.id);
        if (isDuplicate) return prevMessages;
        
        return [...prevMessages, newMessage];
      });
      
      // If the message is from someone else, mark it as read
      if (newMessage.sender_id !== userId) {
        markMessagesAsRead(currentRoomId, userId).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoomId, userId, fetchMessages]);

  // Send a new text message
  const handleSendMessage = useCallback(async () => {
    if (!currentRoomId || !newMessageText.trim() || !userId) return;
    
    try {
      const messageParams: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText
      };
      
      await sendMessage(messageParams);
      
      // Clear the input after sending (the subscription will catch the new message)
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, newMessageText, userId, userName]);

  // Send a voice message
  const handleSendVoiceMessage = useCallback(async (audioUrl: string) => {
    if (!currentRoomId || !userId) return;
    
    try {
      const messageParams: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: audioUrl
      };
      
      await sendMessage(messageParams);
    } catch (err) {
      console.error('Failed to send voice message:', err);
      setError('Failed to send voice message');
      toast({
        title: "Error",
        description: "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Send a file message
  const handleSendFileMessage = useCallback(async (fileMessage: string) => {
    if (!currentRoomId || !userId) return;
    
    try {
      const messageParams: MessageSendParams = {
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: fileMessage
      };
      
      await sendMessage(messageParams);
    } catch (err) {
      console.error('Failed to send file message:', err);
      setError('Failed to send file message');
      toast({
        title: "Error",
        description: "Failed to send file. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoomId, userId, userName]);

  // Flag a message as important or for attention
  const flagMessage = useCallback(async (messageId: string, reason: string) => {
    if (!messageId || !userId) return;
    
    try {
      await flagChatMessage({
        messageId,
        reason,
        userId
      });
      
      // Update the message in the local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_flagged: true, flag_reason: reason } 
            : msg
        )
      );
      
      toast({
        title: "Message flagged",
        description: `The message has been flagged as ${reason}`,
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

  // Simulate typing indicator
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    setTypingTimer(timer);
    
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [typingTimer]);

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
    isTyping,
    handleTyping
  };
};
