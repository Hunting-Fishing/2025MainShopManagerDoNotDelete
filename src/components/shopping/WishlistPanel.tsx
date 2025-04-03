
import React from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/shopping';
import { X } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WishlistPanelProps {
  onClose: () => void;
  visible: boolean;
}

export const WishlistPanel: React.FC<WishlistPanelProps> = ({
  onClose,
  visible
}) => {
  const { wishlistItems, isLoading, removeItem } = useWishlist();

  const panelClass = `fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg z-50 transition-transform duration-300 transform ${
    visible ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <div className={panelClass}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Wishlist</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-grow p-4">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="h-16 w-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
                    {product.price !== undefined && (
                      <p className="text-sm font-semibold text-primary">
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {product.affiliate_link && (
                      <Button 
                        size="sm"
                        onClick={() => window.open(product.affiliate_link, '_blank')}
                      >
                        Buy
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeItem(product.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
