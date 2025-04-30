
import React from 'react';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { useWishlist } from '@/hooks/useWishlist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <ShoppingPageLayout
      title="Your Wishlist"
      description="Items you've saved for later"
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'Wishlist' }
      ]}
    >
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Heart className="h-5 w-5 text-pink-500 mr-2" />
          <span>Your Saved Items ({wishlistItems.length})</span>
        </h2>
        
        {wishlistItems.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearWishlist}
          >
            Clear All
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground mb-4 flex flex-col items-center">
            <Heart className="h-12 w-12 mb-2 stroke-1" />
            <p>Your wishlist is currently empty</p>
          </div>
          <Button asChild>
            <Link to="/shopping/categories">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Categories
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              <div className="p-4 flex gap-4">
                <div className="h-24 w-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                  {item.image || item.image_url ? (
                    <img
                      src={item.image || item.image_url}
                      alt={item.title || item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col">
                  <h3 className="font-medium mb-1">{item.title || item.name}</h3>
                  <p className="text-primary font-semibold mb-auto">
                    ${item.price.toFixed(2)}
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                    {item.affiliate_link && (
                      <Button 
                        size="sm" 
                        className="bg-[#FF9900] hover:bg-[#E68A00] text-white"
                        onClick={() => window.open(item.affiliate_link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on Amazon
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ShoppingPageLayout>
  );
}
