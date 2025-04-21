
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';
import { 
  getChatMessages, 
  getThreadMessages,
  sendChatMessage, 
  flagChatMessage,
  editChatMessage
} from '@/services/chat';
import { supabase } from '@/integrations/supabase/client';

interface UseChatMessagesProps {
  userId: string;
  userName: string;
  currentRoomId: string | null;
}

export const useChatMessages = ({ userId, userName, currentRoomId }: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);
  const [threadMessages, setThreadMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Fetch messages for the current room
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedMessages = await getChatMessages(currentRoomId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${currentRoomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        
        // Don't add thread replies to the main message list
        if (newMessage.thread_parent_id) {
          setThreadMessages(prev => {
            const parentId = newMessage.thread_parent_id!;
            const existingMessages = prev[parentId] || [];
            
            // Check if message already exists
            if (existingMessages.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            
            return {
              ...prev,
              [parentId]: [...existingMessages, newMessage]
            };
          });
          return;
        }
        
        setMessages(prevMessages => {
          // Check if message already exists
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, (payload) => {
        const updatedMessage = payload.new as ChatMessage;
        
        // Update message in the appropriate list
        if (updatedMessage.thread_parent_id) {
          setThreadMessages(prev => {
            const parentId = updatedMessage.thread_parent_id!;
            const existingMessages = prev[parentId] || [];
            return {
              ...prev,
              [parentId]: existingMessages.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            };
          });
          return;
        }
        
        setMessages(prevMessages => 
          prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
      })
      .subscribe();
      
    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${currentRoomId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        
        // Convert the presence state to array of typing users
        const typingUsersList = Object.values(state).flatMap(presence => {
          // Map each typing user to the expected format: { id, name }
          return presence.map((p: any) => ({
            id: p.user_id,
            name: p.user_name
          }));
        });
        
        setTypingUsers(typingUsersList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // We don't need to handle this explicitly as sync will be called
        console.log('User started typing:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // We don't need to handle this explicitly as sync will be called
        console.log('User stopped typing:', leftPresences);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [currentRoomId]);

  // Send a chat message
  const handleSendMessage = async (threadParentId?: string) => {
    if (!currentRoomId || !newMessageText.trim()) return;

    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: newMessageText,
        threadParentId
      });
      
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  // Send a voice message
  const handleSendVoiceMessage = async (audioUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: 'Voice message',
        messageType: 'audio',
        file_url: audioUrl,
        threadParentId
      });
    } catch (err) {
      console.error('Failed to send voice message:', err);
      setError('Failed to send voice message');
    }
  };

  // Send a file message
  const handleSendFileMessage = async (fileUrl: string, threadParentId?: string) => {
    if (!currentRoomId) return;
    
    try {
      await sendChatMessage({
        roomId: currentRoomId,
        senderId: userId,
        senderName: userName,
        content: 'File attachment',
        messageType: 'file',
        file_url: fileUrl,
        threadParentId
      });
    } catch (err) {
      console.error('Failed to send file:', err);
      setError('Failed to send file');
    }
  };

  // Flag a message
  const flagMessage = async (messageId: string, reason: string) => {
    try {
      await flagChatMessage(messageId, reason);
    } catch (err) {
      console.error('Failed to flag message:', err);
      setError('Failed to flag message');
    }
  };

  // Edit a message
  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editChatMessage(messageId, content);
    } catch (err) {
      console.error('Failed to edit message:', err);
      setError('Failed to edit message');
    }
  };

  // Update typing status
  const handleTyping = useCallback(() => {
    if (!currentRoomId || !userId) return;
    
    setIsTyping(true);
    
    const typingChannel = supabase.channel(`typing:${currentRoomId}`);
    
    typingChannel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      
      const presenceTrackStatus = await typingChannel.track({
        user_id: userId,
        user_name: userName
      });
      
      console.log('Typing status tracked:', presenceTrackStatus);
      
      // Stop tracking after a delay
      setTimeout(async () => {
        await typingChannel.untrack();
        setIsTyping(false);
      }, 2000);
    });
    
  }, [currentRoomId, userId, userName]);

  // Open a thread view
  const handleThreadOpen = async (messageId: string) => {
    setActiveThreadId(messageId);
    
    // Load thread messages if not already loaded
    if (!threadMessages[messageId]) {
      try {
        const replies = await getThreadMessages(messageId);
        setThreadMessages(prev => ({
          ...prev,
          [messageId]: replies
        }));
      } catch (err) {
        console.error('Failed to load thread messages:', err);
        setError('Failed to load thread replies');
      }
    }
  };

  // Close the thread view
  const handleThreadClose = () => {
    setActiveThreadId(null);
  };

  // Get thread replies for a message
  const getThreadReplies = async (messageId: string) => {
    try {
      const replies = await getThreadMessages(messageId);
      setThreadMessages(prev => ({
        ...prev,
        [messageId]: replies
      }));
      return replies;
    } catch (err) {
      console.error('Failed to get thread replies:', err);
      setError('Failed to load thread replies');
      return [];
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
    getThreadReplies
  };
};
