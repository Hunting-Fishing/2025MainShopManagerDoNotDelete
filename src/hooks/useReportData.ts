
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { reportData as staticReportData } from "@/data/reportData";
import { DateRange } from "react-day-picker";

interface UseReportDataOptions {
  timeframe?: string;
  dateRange?: DateRange;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [refreshAttempts, setRefreshAttempts] = useState<number>(0);

  // This would normally connect to a real API
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Randomly trigger an error for demo purposes (10% chance)
      if (Math.random() < 0.1 && refreshAttempts > 0) {
        throw new Error("Simulated network error");
      }
      
      // Apply filters and transformations to static data
      const filteredData = applyFilters(staticReportData, { timeframe, dateRange, filters });
      setData(filteredData);
      setLastUpdated(new Date());
      setRefreshAttempts(0);
      
      // Show success toast if this was a manual refresh
      if (refreshAttempts > 0) {
        toast({
          title: "Reports refreshed",
          description: `Reports updated successfully at ${format(new Date(), "h:mm:ss a")}`,
        });
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
      setRefreshAttempts(prev => prev + 1);
      
      toast({
        title: "Error loading reports",
        description: "There was a problem loading the report data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, dateRange, filters, refreshAttempts]);

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

  // Helper function to format date
  const format = (date: Date, formatStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(date);
  };

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, [timeframe, JSON.stringify(filters), fetchReportData]); // Re-fetch when these dependencies change

  // Set up automatic refresh if interval is provided
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      fetchReportData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchReportData]);

  // Auto-retry on error (max 3 attempts)
  useEffect(() => {
    if (error && refreshAttempts > 0 && refreshAttempts <= 3) {
      const retryTimeout = setTimeout(() => {
        console.log(`Retry attempt ${refreshAttempts}...`);
        fetchReportData();
      }, 3000 * refreshAttempts); // Exponential backoff
      
      return () => clearTimeout(retryTimeout);
    }
  }, [error, refreshAttempts, fetchReportData]);

  return {
    data,
    isLoading,
    lastUpdated,
    error,
    refreshData: fetchReportData,
    isRetrying: error && refreshAttempts > 0 && refreshAttempts <= 3
  };
}
