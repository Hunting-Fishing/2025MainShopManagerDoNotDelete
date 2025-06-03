
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search services...",
  className = "",
  suggestions = [],
  onSuggestionSelect
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('serviceSearchHistory');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = (query: string) => {
    if (query.trim().length < 3) return;
    
    const newHistory = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(newHistory);
    localStorage.setItem('serviceSearchHistory', JSON.stringify(newHistory));
  };

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    saveToHistory(suggestion);
    setShowSuggestions(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveToHistory(value.trim());
      setShowSuggestions(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allSuggestions = [
    ...suggestions,
    ...recentSearches.filter(search => 
      search.toLowerCase().includes(value.toLowerCase()) && 
      search.toLowerCase() !== value.toLowerCase()
    )
  ].slice(0, 8);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(value.length > 0 || recentSearches.length > 0)}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('');
              setShowSuggestions(false);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (allSuggestions.length > 0 || (!value && recentSearches.length > 0)) && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto"
        >
          {/* Recent searches when input is empty */}
          {!value && recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Clock className="h-3 w-3" />
                Recent searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded truncate"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {allSuggestions.length > 0 && (
            <div className="p-1">
              {suggestions.length > 0 && (
                <div className="text-xs text-gray-500 px-2 py-1">Suggestions</div>
              )}
              {allSuggestions.map((suggestion, index) => {
                const isRecent = recentSearches.includes(suggestion);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                  >
                    {isRecent && <Clock className="h-3 w-3 text-gray-400" />}
                    <Search className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search tips */}
          {value.length > 0 && allSuggestions.length === 0 && (
            <div className="p-3 text-xs text-gray-500">
              <p className="mb-1">Search tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try searching for "belt", "brake", "oil", etc.</li>
                <li>Use common automotive terms</li>
                <li>Check spelling and try shorter keywords</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
