
import { useState, useCallback } from 'react';
import { ChatMessage, ChatSearchQuery } from '@/types/chat';
import { searchChatMessages } from '@/services/chat/search';

interface UseChatSearchProps {
  roomId: string | null;
}

export const useChatSearch = ({ roomId }: UseChatSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!roomId) return;
    
    try {
      setIsSearching(true);
      setSearchActive(true);
      
      const query: ChatSearchQuery = {
        text: searchTerm
      };
      
      const results = await searchChatMessages(roomId, query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [roomId]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchActive(false);
    setSelectedMessageId(null);
  }, []);

  const selectMessage = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
  }, []);

  return {
    isSearching,
    searchResults,
    searchActive,
    selectedMessageId,
    handleSearch,
    clearSearch,
    selectMessage
  };
};
