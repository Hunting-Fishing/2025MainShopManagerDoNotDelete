
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Heart, ShoppingBag } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWishlist } from '@/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';
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
  const { wishlistItems = [], isAuthenticated, error: wishlistError } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');

  // Display error toast when wishlist errors occur
  React.useEffect(() => {
    if (wishlistError) {
      toast({
        title: "Wishlist Error",
        description: "There was an issue loading your wishlist. Please try again later.",
        variant: "destructive",
      });
      console.error("Wishlist error:", wishlistError);
    }
  }, [wishlistError]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ShoppingHeader: Search submitted:", searchTerm);
    onSearch(searchTerm);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your wishlist",
        variant: "default",
      });
    }
    onToggleWishlist();
  };

  return (
    <div className="flex flex-col space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Amazon Shop</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleToggleWishlist}
            className="relative"
            aria-label="Toggle wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-100 text-red-800 border border-red-300"
                variant="destructive"
              >
                {wishlistItems.length}
              </Badge>
            )}
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
