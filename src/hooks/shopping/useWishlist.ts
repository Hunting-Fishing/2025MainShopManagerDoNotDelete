import { useCallback } from 'react';
import { 
  addToWishlist as addWishlistItem, 
  removeFromWishlist as removeWishlistItem,
  isProductInWishlist 
} from '@/services/wishlistService';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  manufacturer: string;
}

export const useWishlist = () => {
  const addToWishlist = useCallback(async (item: WishlistItem) => {
    try {
      await addWishlistItem(item);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      await removeWishlistItem(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }, []);

  const isInWishlist = useCallback(async (productId: string) => {
    try {
      return await isProductInWishlist(productId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }, []);

  return {
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };
};