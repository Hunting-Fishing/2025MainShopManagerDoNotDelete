import { useState, useEffect } from 'react';
import { getRecentlyViewedProducts } from '@/services/productAnalyticsService';
import { useToast } from '@/hooks/use-toast';

interface RecentlyViewedProduct {
  product_id: string;
  product_name: string;
  category: string;
  viewed_at: string;
}

export const useRecentlyViewedProducts = (userId?: string, sessionId?: string, limit: number = 5) => {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecentlyViewed = async () => {
    try {
      setIsLoading(true);
      const data = await getRecentlyViewedProducts(userId, sessionId, limit);
      // Transform the data to match our interface
      const transformedData: RecentlyViewedProduct[] = data.map((item: any) => ({
        product_id: item.id || item.product_id || '',
        product_name: item.name || item.title || item.product_name || '',
        category: item.category || 'Uncategorized',
        viewed_at: item.viewed_at || new Date().toISOString()
      }));
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching recently viewed products:', error);
      toast({
        title: "Error",
        description: "Failed to load recently viewed products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId || sessionId) {
      fetchRecentlyViewed();
    }
  }, [userId, sessionId, limit]);

  return {
    products,
    isLoading,
    refetch: fetchRecentlyViewed
  };
};