
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages
} from '@/services/chat';

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
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // If the message is from someone else, mark it as read
      if (newMessage.sender_id !== userId) {
        markMessagesAsRead(currentRoomId, userId).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoomId, userId, fetchMessages]);

  // Send a new message
  const handleSendMessage = useCallback(async () => {
    if (!currentRoomId || !newMessageText.trim() || !userId) return;
    
    try {
      const sentMessage = await sendMessage({
        room_id: currentRoomId,
        sender_id: userId,
        sender_name: userName,
        content: newMessageText
      });
      
      // Update local messages (the subscription will also catch this)
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  }, [currentRoomId, newMessageText, userId, userName]);

  return {
    messages,
    loading,
    error,
    newMessageText,
    setNewMessageText,
    handleSendMessage
  };
};
