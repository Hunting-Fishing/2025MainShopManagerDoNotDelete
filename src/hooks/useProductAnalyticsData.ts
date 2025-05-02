
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface ProductAnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalSaved: number;
  conversionRate: number;
  categoryData: { name: string; count: number }[];
  interactionData: {
    name: string;
    views: number;
    clicks: number;
    saves: number;
    shares: number;
  }[];
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
}

interface ProductAnalyticsResult {
  analyticsData: ProductAnalyticsData;
  topProducts: {
    views: TopProduct[];
    clicks: TopProduct[];
  };
  mostSavedProducts: TopProduct[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useProductAnalyticsData = (): ProductAnalyticsResult => {
  const fetchAnalyticsData = async (): Promise<ProductAnalyticsData> => {
    // In a real implementation, this would fetch from Supabase
    // For now, returning mock data
    return {
      totalViews: 12453,
      totalClicks: 3789,
      totalSaved: 842,
      conversionRate: 8.7,
      categoryData: [
        { name: "Engine", count: 3245 },
        { name: "Brakes", count: 2890 },
        { name: "Steering & Suspension", count: 2567 },
        { name: "Diagnostics", count: 1932 },
        { name: "Electrical", count: 1819 }
      ],
      interactionData: [
        { name: "Engine", views: 3245, clicks: 1203, saves: 287, shares: 98 },
        { name: "Brakes", views: 2890, clicks: 954, saves: 201, shares: 67 },
        { name: "Steering", views: 2567, clicks: 876, saves: 145, shares: 42 },
        { name: "Diagnostics", views: 1932, clicks: 756, saves: 209, shares: 86 }
      ]
    };
  };

  const fetchTopProducts = async (): Promise<{
    views: TopProduct[];
    clicks: TopProduct[];
  }> => {
    // Mock data for top products
    return {
      views: [
        { id: "1", name: "OBD-II Scanner", category: "Diagnostics", count: 745, percentage: 5.98 },
        { id: "2", name: "Brake Caliper Tool", category: "Brakes", count: 689, percentage: 5.53 },
        { id: "3", name: "Timing Belt Kit", category: "Engine", count: 612, percentage: 4.91 },
        { id: "4", name: "Torque Wrench", category: "Tools", count: 598, percentage: 4.80 },
        { id: "5", name: "Electric Circuit Tester", category: "Electrical", count: 547, percentage: 4.39 }
      ],
      clicks: [
        { id: "1", name: "OBD-II Scanner", category: "Diagnostics", count: 312, percentage: 8.23 },
        { id: "2", name: "Brake Caliper Tool", category: "Brakes", count: 287, percentage: 7.57 },
        { id: "3", name: "Timing Belt Kit", category: "Engine", count: 243, percentage: 6.41 },
        { id: "4", name: "Torque Wrench", category: "Tools", count: 211, percentage: 5.57 },
        { id: "5", name: "Impact Wrench Set", category: "Tools", count: 189, percentage: 4.99 }
      ]
    };
  };

  const fetchSavedProducts = async (): Promise<TopProduct[]> => {
    // Mock data for saved products
    return [
      { id: "1", name: "OBD-II Scanner", category: "Diagnostics", count: 98, percentage: 11.64 },
      { id: "2", name: "Timing Belt Kit", category: "Engine", count: 87, percentage: 10.33 },
      { id: "3", name: "Brake Caliper Tool", category: "Brakes", count: 76, percentage: 9.03 },
      { id: "4", name: "Compression Tester", category: "Engine", count: 68, percentage: 8.08 },
      { id: "5", name: "Impact Wrench Set", category: "Tools", count: 59, percentage: 7.01 }
    ];
  };

  // Use React Query for data fetching with caching
  const { data: analyticsData, isLoading: isLoadingAnalytics, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['productAnalytics'],
    queryFn: fetchAnalyticsData
  });

  const { data: topProducts, isLoading: isLoadingTop, error: topError, refetch: refetchTop } = useQuery({
    queryKey: ['topProducts'],
    queryFn: fetchTopProducts
  });

  const { data: mostSavedProducts, isLoading: isLoadingSaved, error: savedError, refetch: refetchSaved } = useQuery({
    queryKey: ['savedProducts'],
    queryFn: fetchSavedProducts
  });

  const isLoading = isLoadingAnalytics || isLoadingTop || isLoadingSaved;
  const error = analyticsError || topError || savedError;

  const refetch = () => {
    refetchAnalytics();
    refetchTop();
    refetchSaved();
  };

  return {
    analyticsData: analyticsData || {
      totalViews: 0,
      totalClicks: 0,
      totalSaved: 0,
      conversionRate: 0,
      categoryData: [],
      interactionData: []
    },
    topProducts: topProducts || { views: [], clicks: [] },
    mostSavedProducts: mostSavedProducts || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};
