
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { addToCart } from '@/services/shopping/cartService';
import { toast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/useAuthUser';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function AddToCartButton({ 
  productId, 
  quantity = 1, 
  className = '',
  disabled = false,
  onSuccess
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { userId, isAuthenticated } = useAuthUser();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(productId, quantity);
      
      // Show success state briefly
      setSuccess(true);
      toast({
        title: "Added to Cart",
        description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={isLoading || disabled || success} 
      className={`transition-all ${className} ${success ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
          Adding...
        </span>
      ) : success ? (
        <span className="flex items-center">
          <Check className="h-4 w-4 mr-2" />
          Added
        </span>
      ) : (
        <span className="flex items-center">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </span>
      )}
    </Button>
  );
}
