
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { reportData as staticReportData } from "@/data/reportData";

interface UseReportDataOptions {
  timeframe?: string;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  filters?: Record<string, any>;
  refreshInterval?: number | null;
}

export function useReportData({
  timeframe = 'monthly',
  dateRange,
  filters = {},
  refreshInterval = null
}: UseReportDataOptions = {}) {
  const [data, setData] = useState<any>(staticReportData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // This would normally connect to a real API
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Apply filters and transformations to static data
      const filteredData = applyFilters(staticReportData, { timeframe, dateRange, filters });
      setData(filteredData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
      toast({
        title: "Error loading reports",
        description: "There was a problem loading the report data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to the data (simulated)
  const applyFilters = (data: any, options: UseReportDataOptions) => {
    // In a real app, this would apply sophisticated filtering logic
    const result = { ...data };
    
    // Example: Filter sales data by timeframe
    if (options.timeframe === 'quarterly') {
      result.salesData = data.salesData.filter((_: any, index: number) => index % 3 === 0);
    } else if (options.timeframe === 'yearly') {
      result.salesData = [
        { month: 'Year Total', revenue: data.salesData.reduce((sum: number, item: any) => sum + item.revenue, 0), 
          expenses: data.salesData.reduce((sum: number, item: any) => sum + item.expenses, 0) }
      ];
    }
    
    // Apply custom filters if they exist
    if (options.filters && Object.keys(options.filters).length > 0) {
      if (options.filters.showHighRevenue) {
        result.topSellingItems = data.topSellingItems.filter((item: any) => item.revenue > 5000);
      }
      
      if (options.filters.serviceType) {
        // Filter by service type (simulated)
        console.log(`Filtering by service type: ${options.filters.serviceType}`);
      }
    }
    
    return result;
  };

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, [timeframe, JSON.stringify(filters)]); // Re-fetch when these dependencies change

  // Set up automatic refresh if interval is provided
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      fetchReportData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, timeframe, JSON.stringify(filters)]);

  return {
    data,
    isLoading,
    lastUpdated,
    error,
    refreshData: fetchReportData
  };
}
