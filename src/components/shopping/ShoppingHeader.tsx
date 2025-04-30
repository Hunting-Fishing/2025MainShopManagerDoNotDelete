
import React, { useState } from 'react';
import { Search, Heart, Filter, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/hooks/useWishlist';
import { Link } from 'react-router-dom';

interface ShoppingHeaderProps {
  onSearch?: (term: string) => void;
  onToggleFilters?: () => void;
  onToggleWishlist?: () => void;
}

export const ShoppingHeader: React.FC<ShoppingHeaderProps> = ({
  onSearch = () => {},
  onToggleFilters = () => {},
  onToggleWishlist = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { wishlistItems } = useWishlist();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </form>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onToggleFilters}
          >
            <Filter size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative"
            asChild
          >
            <Link to="/shopping/wishlist">
              <Heart size={18} />
              {wishlistItems && wishlistItems.length > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center bg-blue-500"
                  variant="secondary"
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
