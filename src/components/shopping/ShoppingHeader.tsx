
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Search, SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

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
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ShoppingHeader: Search submitted:", searchTerm);
    onSearch(searchTerm);
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Amazon Shop</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleWishlist}
            aria-label="View saved items"
            className="text-pink-500 border-pink-200 hover:bg-pink-50"
          >
            <Heart className="h-5 w-5" />
          </Button>
          
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onToggleFilters}
              aria-label="Toggle filters"
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
              aria-label="Search products"
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
