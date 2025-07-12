import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getWishlistItems, removeFromWishlist, WishlistItem } from '@/services/wishlistService';
import { useCartStore } from '@/stores/cartStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const { addItem } = useCartStore();

  useEffect(() => {
    loadWishlistItems();
  }, []);

  const loadWishlistItems = async () => {
    try {
      const items = await getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: "Error loading wishlist",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemovingIds(prev => new Set(prev.add(productId)));
      await removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist."
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error removing item",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.product) return;
    
    addItem({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image_url
    });

    toast({
      title: "Added to cart",
      description: `${item.product.name} has been added to your cart.`
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <span className="text-lg text-muted-foreground">
            ({wishlistItems.length} items)
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add items to your wishlist to save them for later!
            </p>
            <Button onClick={() => window.location.href = '/shopping'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {item.product?.image_url && (
                    <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                    
                    {item.product?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${item.product?.price.toFixed(2)}
                      </span>
                      
                      {item.product?.stock_quantity !== undefined && (
                        <span className={`text-sm ${
                          item.product.stock_quantity > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {item.product.stock_quantity > 0 
                            ? `${item.product.stock_quantity} in stock`
                            : 'Out of stock'
                          }
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.product || item.product.stock_quantity === 0}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                        disabled={removingIds.has(item.product_id)}
                      >
                        {removingIds.has(item.product_id) ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};