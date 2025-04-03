
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Heart, ShoppingBag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWishlist } from '@/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';

interface ShoppingHeaderProps {
  onSearch: (searchTerm: string) => void;
  onToggleFilters: () => void;
  onToggleWishlist: () => void;
}

export const ShoppingHeader: React.FC<ShoppingHeaderProps> = ({
  onSearch,
  onToggleFilters,
  onToggleWishlist
}) => {
  const isMobile = useIsMobile();
  const { wishlistItems, isAuthenticated } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopping Quick Links</h1>
        
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onToggleWishlist}
              className="relative"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                  variant="destructive"
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </Button>
          )}
          
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onToggleFilters}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {isMobile && (
        <form onSubmit={handleSearchSubmit} className="flex w-full">
          <div className="relative flex-grow">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-10"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
