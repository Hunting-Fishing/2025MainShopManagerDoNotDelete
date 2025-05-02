
import { useQuery } from '@tanstack/react-query';

interface ProductByCategoryData {
  name: string;
  count: number;
  color: string;
}

interface SubmissionStatusData {
  name: string;
  value: number;
  color: string;
}

export interface ShoppingAnalyticsData {
  totalProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalManufacturers: number;
  productsByCategory: ProductByCategoryData[];
  submissionStatusData: SubmissionStatusData[];
  totalSubmissions: number;
}

export function useShoppingAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['shoppingAnalytics'],
    queryFn: async (): Promise<ShoppingAnalyticsData> => {
      try {
        // In a real implementation, we would fetch this data from the API
        // For now, we'll return mock data to demonstrate the UI
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          totalProducts: 347,
          featuredProducts: 42,
          totalCategories: 11,
          totalManufacturers: 28,
          productsByCategory: [
            { name: 'Engine', count: 87, color: '#4287f5' },
            { name: 'Brakes', count: 64, color: '#f54242' },
            { name: 'Electrical', count: 56, color: '#f5d442' },
            { name: 'Drivetrain', count: 42, color: '#42f554' },
            { name: 'Exhaust', count: 38, color: '#8d42f5' },
            { name: 'Body', count: 32, color: '#f542b3' },
            { name: 'Other', count: 28, color: '#42f5d1' }
          ],
          submissionStatusData: [
            { name: 'Pending Review', value: 24, color: '#f5a742' },
            { name: 'Approved', value: 83, color: '#42f554' },
            { name: 'Rejected', value: 16, color: '#f54242' },
            { name: 'Modifications Requested', value: 9, color: '#4287f5' }
          ],
          totalSubmissions: 132
        };
      } catch (error) {
        console.error("Error fetching shopping analytics data:", error);
        throw error;
      }
    },
    initialData: {
      totalProducts: 0,
      featuredProducts: 0,
      totalCategories: 0,
      totalManufacturers: 0,
      productsByCategory: [],
      submissionStatusData: [],
      totalSubmissions: 0
    }
  });

  return {
    analyticsData: data,
    isLoading,
    error
  };
}
