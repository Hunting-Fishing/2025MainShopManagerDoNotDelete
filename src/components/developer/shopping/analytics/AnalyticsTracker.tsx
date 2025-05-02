
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AffiliateProduct } from '@/types/affiliate';
import { useToast } from '@/components/ui/use-toast';

export enum ProductInteractionType {
  VIEW = 'view',
  CLICK = 'click',
  SAVE = 'save',
  UNSAVE = 'unsave',
  SHARE = 'share',
  ADD_TO_CART = 'add_to_cart'
}

interface TrackProductViewProps {
  productId: string;
  productName: string;
  category: string;
  source?: string;
}

interface TrackProductInteractionProps {
  productId: string;
  productName: string;
  interactionType: ProductInteractionType;
  category: string;
  additionalData?: Record<string, any>;
}

interface ProductAnalytics {
  product_id: string;
  product_name: string;
  interaction_type: ProductInteractionType;
  category: string;
  additional_data?: Record<string, any>;
}

/**
 * Hook to track product interactions
 */
export const useProductAnalytics = () => {
  const { toast } = useToast();

  const trackView = useCallback(async ({ productId, productName, category, source }: TrackProductViewProps) => {
    try {
      const analyticsData: ProductAnalytics = {
        product_id: productId,
        product_name: productName,
        interaction_type: ProductInteractionType.VIEW,
        category,
        additional_data: source ? { source } : undefined,
      };
      
      await supabase
        .from('product_analytics')
        .insert(analyticsData);
    } catch (error) {
      console.error('Failed to track product view:', error);
    }
  }, []);

  const trackInteraction = useCallback(async ({ 
    productId, 
    productName, 
    interactionType, 
    category, 
    additionalData 
  }: TrackProductInteractionProps) => {
    try {
      const analyticsData: ProductAnalytics = {
        product_id: productId,
        product_name: productName,
        interaction_type: interactionType,
        category,
        additional_data: additionalData,
      };
      
      await supabase
        .from('product_analytics')
        .insert(analyticsData);
    } catch (error) {
      console.error(`Failed to track product ${interactionType}:`, error);
    }
  }, []);

  return {
    trackView,
    trackInteraction
  };
};

/**
 * Component to automatically track product views
 */
export const ProductViewTracker: React.FC<{ product: AffiliateProduct }> = ({ product }) => {
  const { trackView } = useProductAnalytics();
  
  useEffect(() => {
    trackView({
      productId: product.id,
      productName: product.name,
      category: product.category,
      source: window.location.pathname
    });
  }, [product.id, trackView, product.name, product.category]);
  
  return null; // This is a tracking component, so it doesn't render anything
};
