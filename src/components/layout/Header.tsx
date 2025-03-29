
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, Search, X, Bell, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchResults } from '@/components/search/SearchResults';
import { performSearch, SearchResult } from '@/utils/searchUtils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AddNotificationDemo } from '@/components/notifications/AddNotificationDemo';
import { GlobalCommandMenu } from '@/components/search/GlobalCommandMenu';

export function Header() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      const results = performSearch(searchQuery);
      setSearchResults(results);
      setShowResults(true);
      setIsSearching(false);
      
      // Track search analytics
      if (results.length === 0) {
        console.log('Search with no results:', searchQuery);
      }
    }
  };

  // Update search results as user types
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setSearchResults(performSearch(searchQuery));
        setShowResults(true);
        setIsSearching(false);
      }, 300); // Debounce
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K to open command menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(true);
      }
      
      // CMD/CTRL + / to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC to close search results
      if (e.key === 'Escape' && showResults) {
        setShowResults(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showResults]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Navigate to search result
  const handleResultClick = (url: string) => {
    clearSearch();
    navigate(url);
  };

  return (
    <header className="border-b border-slate-200 bg-white py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-md w-full" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search for work orders, inventory, customers..."
              className="pl-10 w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          
          <div className="absolute right-3 -top-7 text-xs text-slate-500">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 mr-1">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">K</kbd>
          </div>
          
          {isSearching && (
            <div className="absolute mt-1 w-full z-50 bg-white shadow-lg rounded-md p-4 flex justify-center items-center">
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                <span className="text-sm text-slate-500">Searching...</span>
              </div>
            </div>
          )}
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute mt-1 w-full z-50">
              <SearchResults results={searchResults} onItemClick={handleResultClick} />
            </div>
          )}
          
          {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute mt-1 w-full z-50 bg-white shadow-lg rounded-md p-4 text-center">
              <p className="text-slate-500">No results found for "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try using different keywords or check spelling</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm flex items-center gap-1"
            onClick={() => setIsCommandMenuOpen(true)}
          >
            <Command className="h-3.5 w-3.5" />
            <span>Command</span>
            <kbd className="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
          </Button>
        
          <AddNotificationDemo />
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-slate-500">admin@easyshopmanager.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <GlobalCommandMenu 
        open={isCommandMenuOpen} 
        onOpenChange={setIsCommandMenuOpen}
        onSearch={(query) => {
          setSearchQuery(query);
          setIsCommandMenuOpen(false);
          if (query.trim()) {
            handleSearch(new Event('submit') as any);
          }
        }}
      />
    </header>
  );
}
