import { useCallback } from 'react';
import { trackProductInteraction, InteractionType } from '@/services/productAnalyticsService';
import { addRecentlyViewedProduct } from '@/services/recentlyViewedService';

export interface ProductInteractionData {
  productId: string;
  productName: string;
  category?: string;
  interactionType: InteractionType;
  metadata?: Record<string, any>;
}

export const useProductAnalytics = () => {
  const trackInteraction = useCallback(async (data: ProductInteractionData) => {
    try {
      // Track the interaction in analytics
      await trackProductInteraction({
        product_id: data.productId,
        product_name: data.productName,
        category: data.category,
        interaction_type: data.interactionType,
        metadata: data.metadata
      });

      // If it's a view interaction, also add to recently viewed
      if (data.interactionType === 'view') {
        await addRecentlyViewedProduct({
          product_id: data.productId,
          product_name: data.productName,
          category: data.category
        });
      }
    } catch (error) {
      console.error('Error tracking product interaction:', error);
      // Don't throw error - analytics should not break user experience
    }
  }, []);

  return { trackInteraction };
};