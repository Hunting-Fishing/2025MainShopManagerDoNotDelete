
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types/chat';
import { StatusBadge } from '@/components/chat/dialog/StatusBadge';

interface MessageSearchProps {
  onSearch: (searchTerm: string) => void;
  searchResults: ChatMessage[];
  isSearching: boolean;
  onClearSearch: () => void;
  onSelectMessage: (messageId: string) => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  onSearch,
  searchResults,
  isSearching,
  onClearSearch,
  onSelectMessage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        onSearch(searchTerm);
      }
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);
  
  const handleClear = () => {
    setSearchTerm('');
    onClearSearch();
  };
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full w-10" 
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      {searchTerm.trim().length >= 2 && (
        <div className="space-y-2">
          {isSearching ? (
            <div className="text-center py-2">
              <StatusBadge status="info" text="Searching..." />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border rounded-md bg-white dark:bg-gray-800">
              <ul className="divide-y">
                {searchResults.map(message => (
                  <li 
                    key={message.id} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                    onClick={() => onSelectMessage(message.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{message.sender_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm truncate">{message.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-2">
              <StatusBadge status="warning" text="No results found" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
