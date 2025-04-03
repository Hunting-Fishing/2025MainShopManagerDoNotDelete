
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/shopping';
import { 
  getWishlistItems, 
  addToWishlist, 
  removeFromWishlist,
  isInWishlist 
} from '@/services/shopping/wishlistService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    return !!data.user;
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const isAuthed = await checkAuthentication();
      setIsAuthenticated(isAuthed);
      
      if (isAuthed) {
        const items = await getWishlistItems();
        setWishlistItems(items);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast({
        title: "Error loading wishlist",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthentication]);

  useEffect(() => {
    fetchWishlist();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchWishlist();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWishlist]);

  const addItem = async (productId: string): Promise<boolean> => {
    try {
      if (!await checkAuthentication()) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your wishlist",
          variant: "destructive",
        });
        return false;
      }

      await addToWishlist(productId);
      await fetchWishlist();
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist",
      });
      return true;
    } catch (err) {
      toast({
        title: "Error adding to wishlist",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeItem = async (productId: string): Promise<boolean> => {
    try {
      if (!await checkAuthentication()) {
        return false;
      }

      await removeFromWishlist(productId);
      await fetchWishlist();
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist",
      });
      return true;
    } catch (err) {
      toast({
        title: "Error removing from wishlist",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkIfInWishlist = async (productId: string): Promise<boolean> => {
    try {
      if (!await checkAuthentication()) {
        return false;
      }
      return await isInWishlist(productId);
    } catch (err) {
      console.error("Error checking wishlist:", err);
      return false;
    }
  };

  return {
    wishlistItems,
    isLoading,
    error,
    isAuthenticated,
    addItem,
    removeItem,
    checkIfInWishlist,
    refreshWishlist: fetchWishlist
  };
}
