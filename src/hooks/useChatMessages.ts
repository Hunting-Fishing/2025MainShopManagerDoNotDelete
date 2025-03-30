
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages
} from '@/services/chat';
import { toast } from '@/hooks/use-toast';

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
      await sendMessage({
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText
      });
      
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
      await sendMessage({
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: audioUrl
      });
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
    isTyping,
    handleTyping
  };
};
