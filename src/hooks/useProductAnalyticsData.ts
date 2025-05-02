
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ProductInteraction } from '@/components/developer/shopping/analytics/ProductInteractionsChart';
import { TopProductAnalytics } from '@/components/developer/shopping/analytics/TopProductsTable';

export interface ProductAnalytics {
  totalViews: number;
  totalClicks: number;
  totalSaved: number;
  conversionRate: number;
  categoryData: {
    name: string;
    views: number;
    clicks: number;
    saves: number;
    shares: number;
  }[];
  interactionData: ProductInteraction[];
}

export function useProductAnalyticsData() {
  // In a real implementation, this would fetch data from Supabase
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['productAnalyticsData'],
    queryFn: async (): Promise<ProductAnalytics> => {
      try {
        // This would be replaced by actual Supabase calls in a real implementation
        // For now, return mock data to simulate the analytics
        
        // In a real implementation, we could use functions like:
        // const { data: categoryData } = await supabase.rpc('get_product_interactions_by_category');
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        return {
          totalViews: 1547,
          totalClicks: 423,
          totalSaved: 98,
          conversionRate: 27.34,
          categoryData: [
            { name: 'Hand Tools', views: 520, clicks: 182, saves: 35, shares: 12 },
            { name: 'Power Tools', views: 380, clicks: 95, saves: 22, shares: 8 },
            { name: 'Diagnostic Tools', views: 230, clicks: 78, saves: 19, shares: 15 },
            { name: 'Electronic Tools', views: 417, clicks: 68, saves: 22, shares: 9 }
          ],
          interactionData: [
            { name: 'Hand Tools', views: 520, clicks: 182, saves: 35, shares: 12 },
            { name: 'Power Tools', views: 380, clicks: 95, saves: 22, shares: 8 },
            { name: 'Diagnostic Tools', views: 230, clicks: 78, saves: 19, shares: 15 },
            { name: 'Electronic Tools', views: 417, clicks: 68, saves: 22, shares: 9 }
          ]
        };
      } catch (error) {
        console.error("Error fetching product analytics:", error);
        throw error;
      }
    },
    initialData: {
      totalViews: 0,
      totalClicks: 0,
      totalSaved: 0,
      conversionRate: 0,
      categoryData: [],
      interactionData: []
    }
  });

  // Process data for top products with percentages
  const processTopProducts = (products: any[], totalCount: number): TopProductAnalytics[] => {
    return products.map(product => ({
      ...product,
      percentage: totalCount > 0 ? (product.count / totalCount) * 100 : 0
    }));
  };

  // For top products data (in a real implementation, this would be a separate query)
  const topViewsData = [
    { id: '1', name: 'Premium Socket Set', count: 253, category: 'Hand Tools' },
    { id: '3', name: 'Heavy-Duty Impact Wrench', count: 187, category: 'Power Tools' },
    { id: '2', name: 'Professional Digital Multimeter', count: 145, category: 'Electronic Tools' },
    { id: '4', name: 'Automotive Diagnostic Scanner', count: 112, category: 'Diagnostic Tools' },
    { id: '5', name: 'Mechanic Tool Set (250pc)', count: 98, category: 'Hand Tools' }
  ];
  
  const topClicksData = [
    { id: '1', name: 'Premium Socket Set', count: 87, category: 'Hand Tools' },
    { id: '3', name: 'Heavy-Duty Impact Wrench', count: 65, category: 'Power Tools' },
    { id: '4', name: 'Automotive Diagnostic Scanner', count: 52, category: 'Diagnostic Tools' },
    { id: '2', name: 'Professional Digital Multimeter', count: 41, category: 'Electronic Tools' },
    { id: '5', name: 'Mechanic Tool Set (250pc)', count: 28, category: 'Hand Tools' }
  ];
  
  const topSavesData = [
    { id: '1', name: 'Premium Socket Set', count: 35, category: 'Hand Tools' },
    { id: '3', name: 'Heavy-Duty Impact Wrench', count: 22, category: 'Power Tools' },
    { id: '2', name: 'Professional Digital Multimeter', count: 19, category: 'Electronic Tools' },
    { id: '4', name: 'Automotive Diagnostic Scanner', count: 12, category: 'Diagnostic Tools' },
    { id: '5', name: 'Mechanic Tool Set (250pc)', count: 10, category: 'Hand Tools' }
  ];

  const totalViews = topViewsData.reduce((sum, item) => sum + item.count, 0);
  const totalClicks = topClicksData.reduce((sum, item) => sum + item.count, 0);
  const totalSaves = topSavesData.reduce((sum, item) => sum + item.count, 0);

  const topProducts = {
    views: processTopProducts(topViewsData, totalViews),
    clicks: processTopProducts(topClicksData, totalClicks)
  };
  
  const mostSavedProducts = processTopProducts(topSavesData, totalSaves);

  return {
    analyticsData: data,
    topProducts,
    mostSavedProducts,
    isLoading,
    error,
    refetch
  };
}
