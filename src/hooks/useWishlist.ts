
import { useState, useEffect } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  
  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Error parsing wishlist from localStorage:", error);
        setWishlistItems([]);
      }
    }
  }, []);
  
  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);
  
  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems(prev => {
      // Don't add if already in wishlist
      if (prev.some(i => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };
  
  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
  };
  
  const isInWishlist = (itemId: string) => {
    return wishlistItems.some(item => item.id === itemId);
  };
  
  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  };
}
