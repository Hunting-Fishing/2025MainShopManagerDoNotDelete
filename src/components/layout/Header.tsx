import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, Search, X, Bell } from 'lucide-react';
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

export function Header() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchResults(performSearch(searchQuery));
      setShowResults(true);
    }
  };

  // Update search results as user types
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 2) {
      setSearchResults(performSearch(searchQuery));
      setShowResults(true);
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

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Handle search result click
  const handleResultClick = () => {
    clearSearch();
  };

  return (
    <header className="border-b border-slate-200 bg-white py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-md w-full" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
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
          
          {showResults && (
            <div className="absolute mt-1 w-full z-50">
              <SearchResults results={searchResults} onItemClick={handleResultClick} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
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
    </header>
  );
}
