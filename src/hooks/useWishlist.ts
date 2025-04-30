
import { useState, useEffect } from 'react';
import { Product } from '@/types/shopping';

export interface WishlistItem {
  id: string;
  name: string;
  title: string;
  price: number;
  image?: string;
  image_url?: string;
  affiliate_link?: string;
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = true; // For now, assume the user is always authenticated
  
  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const loadWishlist = () => {
      setIsLoading(true);
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error("Error parsing wishlist from localStorage:", error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWishlist();
  }, []);
  
  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);
  
  // Add item to wishlist
  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems(prev => {
      // Don't add if already in wishlist
      if (prev.some(i => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };
  
  // Remove item from wishlist
  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Clear wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };
  
  // Check if item is in wishlist
  const isInWishlist = (itemId: string) => {
    return wishlistItems.some(item => item.id === itemId);
  };
  
  // Add aliases for compatibility with components that expect different method names
  const addItem = (id: string | Product) => {
    const itemId = typeof id === 'string' ? id : id.id;
    const existingItem = wishlistItems.find(item => item.id === itemId);
    
    if (existingItem) {
      return;
    }
    
    // If we received a product object, convert it to a wishlist item
    if (typeof id !== 'string') {
      const product = id;
      addToWishlist({
        id: product.id,
        name: product.title,
        title: product.title,
        price: product.price || 0,
        image_url: product.image_url,
        image: product.image_url,
        affiliate_link: product.affiliate_link
      });
    } else {
      // For simplicity, if only ID is provided, create a minimal item
      addToWishlist({
        id: itemId,
        name: `Product ${itemId}`,
        title: `Product ${itemId}`,
        price: 0
      });
    }
  };
  
  // Alias for removeFromWishlist for compatibility
  const removeItem = removeFromWishlist;
  
  // Alias for isInWishlist that returns a Promise for compatibility
  const checkIfInWishlist = async (itemId: string) => {
    return isInWishlist(itemId);
  };
  
  return {
    wishlistItems,
    isLoading,
    isAuthenticated,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    // Aliases for compatibility
    addItem,
    removeItem,
    checkIfInWishlist
  };
}
