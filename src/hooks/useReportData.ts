
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { format as formatDate } from "date-fns";
import { ReportDataPoint, ComparisonReportData } from "@/types/reports";

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
  const [data, setData] = useState<any>({
    salesData: [],
    workOrderStatusData: [],
    topSellingItems: [],
    servicePerformance: [],
    comparisonRevenueData: [],
    comparisonServiceData: [],
    inventoryData: {
      statusData: [],
      turnoverData: [],
      lowStockItems: []
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [refreshAttempts, setRefreshAttempts] = useState<number>(0);

  // Fetch real data from the database
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get date range for filtering
      const startDate = dateRange?.from ? formatDate(dateRange.from, "yyyy-MM-dd") : 
        formatDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), "yyyy-MM-dd");
      const endDate = dateRange?.to ? formatDate(dateRange.to, "yyyy-MM-dd") : 
        formatDate(new Date(), "yyyy-MM-dd");

      // 1. Fetch work order status data
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('id, status, created_at, total_cost');
      
      if (workOrdersError) throw workOrdersError;
      
      // Count status distribution
      const statusCounts: Record<string, number> = {};
      workOrdersData.forEach((order: any) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      const workOrderStatusData: ReportDataPoint[] = [
        { name: 'Completed', value: statusCounts['completed'] || 0, color: '#0ea5e9' },
        { name: 'In Progress', value: statusCounts['in-progress'] || 0, color: '#f97316' },
        { name: 'Pending', value: statusCounts['pending'] || 0, color: '#8b5cf6' },
        { name: 'Cancelled', value: statusCounts['cancelled'] || 0, color: '#ef4444' }
      ];
      
      // 2. Fetch sales data (monthly revenue and expenses)
      const salesData = await fetchSalesData(startDate, endDate, timeframe);
      
      // 3. Fetch top selling items
      const topSellingItems = await fetchTopSellingItems();
      
      // 4. Fetch service performance data
      const servicePerformance = await fetchServicePerformance(startDate, endDate);
      
      // 5. Fetch comparison data if requested
      let comparisonRevenueData: ComparisonReportData[] = [];
      let comparisonServiceData: ComparisonReportData[] = [];
      
      if (filters.showComparison) {
        const { revenueComparison, serviceComparison } = await fetchComparisonData();
        comparisonRevenueData = revenueComparison;
        comparisonServiceData = serviceComparison;
      }
      
      // 6. Fetch inventory data
      const inventoryData = await fetchInventoryData();

      // Set the complete data object
      setData({
        salesData,
        workOrderStatusData,
        topSellingItems,
        servicePerformance,
        comparisonRevenueData,
        comparisonServiceData,
        inventoryData
      });
      
      setLastUpdated(new Date());
      setRefreshAttempts(0);
      
      // Show success toast if this was a manual refresh
      if (refreshAttempts > 0) {
        toast({
          title: "Reports refreshed",
          description: `Reports updated successfully at ${formatTime(new Date())}`,
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

  // Helper function to fetch sales data
  const fetchSalesData = async (startDate: string, endDate: string, timeframe: string) => {
    // Get work orders with total costs for revenue
    const { data: workOrders, error: woError } = await supabase
      .from('work_orders')
      .select('id, created_at, total_cost')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at');
    
    if (woError) throw woError;
    
    // Get inventory items for cost of goods (expenses estimation)
    const { data: inventoryItems, error: invError } = await supabase
      .from('work_order_inventory_items')
      .select('id, created_at, unit_price, quantity');
    
    if (invError) throw invError;
    
    // Group by month
    const monthlyData: Record<string, { revenue: number, expenses: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months
    months.forEach(month => {
      monthlyData[month] = { revenue: 0, expenses: 0 };
    });
    
    // Calculate revenue
    workOrders.forEach((order: any) => {
      const date = new Date(order.created_at);
      const month = months[date.getMonth()];
      monthlyData[month].revenue += Number(order.total_cost) || 0;
    });
    
    // Estimate expenses (for this example, we'll use inventory items as a proxy)
    inventoryItems.forEach((item: any) => {
      const date = new Date(item.created_at);
      const month = months[date.getMonth()];
      monthlyData[month].expenses += (Number(item.unit_price) * Number(item.quantity)) * 0.6; // Assuming 60% cost
    });
    
    // Convert to array based on timeframe
    if (timeframe === 'monthly') {
      return months.map(month => ({
        month,
        revenue: Math.round(monthlyData[month].revenue),
        expenses: Math.round(monthlyData[month].expenses)
      }));
    } else if (timeframe === 'quarterly') {
      // Group by quarters
      const quarters = [
        {month: 'Q1', revenue: 0, expenses: 0},
        {month: 'Q2', revenue: 0, expenses: 0},
        {month: 'Q3', revenue: 0, expenses: 0},
        {month: 'Q4', revenue: 0, expenses: 0}
      ];
      
      months.forEach((month, idx) => {
        const quarterIndex = Math.floor(idx / 3);
        quarters[quarterIndex].revenue += monthlyData[month].revenue;
        quarters[quarterIndex].expenses += monthlyData[month].expenses;
      });
      
      return quarters.map(q => ({
        month: q.month,
        revenue: Math.round(q.revenue),
        expenses: Math.round(q.expenses)
      }));
    } else {
      // Yearly
      const yearlyRevenue = Object.values(monthlyData).reduce((sum, m) => sum + m.revenue, 0);
      const yearlyExpenses = Object.values(monthlyData).reduce((sum, m) => sum + m.expenses, 0);
      
      return [{
        month: 'Year Total',
        revenue: Math.round(yearlyRevenue),
        expenses: Math.round(yearlyExpenses)
      }];
    }
  };

  // Helper function to fetch top selling items
  const fetchTopSellingItems = async () => {
    // Aggregate inventory items from work orders
    const { data: items, error } = await supabase
      .from('work_order_inventory_items')
      .select('name, quantity, unit_price');
    
    if (error) throw error;
    
    // Group and calculate totals
    const itemMap: Record<string, {quantity: number, revenue: number}> = {};
    
    items.forEach((item: any) => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = { quantity: 0, revenue: 0 };
      }
      
      itemMap[item.name].quantity += Number(item.quantity);
      itemMap[item.name].revenue += Number(item.quantity) * Number(item.unit_price);
    });
    
    // Convert to array and sort by revenue
    return Object.entries(itemMap)
      .map(([name, data], index) => ({
        id: index + 1,
        name,
        quantity: data.quantity,
        revenue: Math.round(data.revenue)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5
  };

  // Helper function to fetch service performance data
  const fetchServicePerformance = async (startDate: string, endDate: string) => {
    // For service performance, we'll check work orders completed on time vs delayed
    // This is a simplified version - in a real app, you'd compare due dates with completion dates
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('id, created_at, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at');
    
    if (error) throw error;
    
    // Group by month
    const monthlyData: Record<string, { completedOnTime: number, delayed: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months
    months.forEach(month => {
      monthlyData[month] = { completedOnTime: 0, delayed: 0 };
    });
    
    // For this example, we'll randomly assign some as completed on time and others as delayed
    // In a real app, you'd have actual data about whether a work order was completed on time
    workOrders.forEach((order: any) => {
      const date = new Date(order.created_at);
      const month = months[date.getMonth()];
      
      // For demo, assume 80% are on time
      if (Math.random() > 0.2) {
        monthlyData[month].completedOnTime += 1;
      } else {
        monthlyData[month].delayed += 1;
      }
    });
    
    // Convert to array for the last 6 months
    const today = new Date();
    const result = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (today.getMonth() - i + 12) % 12; // Handle wrapping around to previous year
      const month = months[monthIndex];
      
      result.push({
        month,
        completedOnTime: monthlyData[month].completedOnTime,
        delayed: monthlyData[month].delayed
      });
    }
    
    return result;
  };

  // Helper function to fetch comparison data
  const fetchComparisonData = async () => {
    // Current period data (last 30 days)
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    
    // Previous period (30-60 days ago)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 31);
    
    // Fetch work orders for both periods
    const { data: currentWorkOrders, error: currentError } = await supabase
      .from('work_orders')
      .select('id, total_cost, status, created_at')
      .gte('created_at', formatDate(currentPeriodStart, "yyyy-MM-dd"))
      .lte('created_at', formatDate(new Date(), "yyyy-MM-dd"));
    
    if (currentError) throw currentError;
    
    const { data: previousWorkOrders, error: previousError } = await supabase
      .from('work_orders')
      .select('id, total_cost, status, created_at')
      .gte('created_at', formatDate(previousPeriodStart, "yyyy-MM-dd"))
      .lte('created_at', formatDate(previousPeriodEnd, "yyyy-MM-dd"));
    
    if (previousError) throw previousError;
    
    // Calculate revenue metrics
    const currentRevenue = currentWorkOrders.reduce((sum: number, order: any) => sum + (Number(order.total_cost) || 0), 0);
    const previousRevenue = previousWorkOrders.reduce((sum: number, order: any) => sum + (Number(order.total_cost) || 0), 0);
    
    // Service revenue (80% of total as an example)
    const currentServiceRevenue = currentRevenue * 0.8;
    const previousServiceRevenue = previousRevenue * 0.8;
    
    // Parts revenue (20% of total as an example)
    const currentPartsRevenue = currentRevenue * 0.2;
    const previousPartsRevenue = previousRevenue * 0.2;
    
    // Average ticket
    const currentAvgTicket = currentWorkOrders.length > 0 ? currentRevenue / currentWorkOrders.length : 0;
    const previousAvgTicket = previousWorkOrders.length > 0 ? previousRevenue / previousWorkOrders.length : 0;
    
    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 100; // If previous was zero, it's a 100% increase
      return Math.round(((current - previous) / previous) * 100);
    };
    
    // Revenue comparison data
    const revenueComparison: ComparisonReportData[] = [
      {
        name: 'Total Revenue',
        current: Math.round(currentRevenue),
        previous: Math.round(previousRevenue),
        change: calculateChange(currentRevenue, previousRevenue)
      },
      {
        name: 'Service Revenue',
        current: Math.round(currentServiceRevenue),
        previous: Math.round(previousServiceRevenue),
        change: calculateChange(currentServiceRevenue, previousServiceRevenue)
      },
      {
        name: 'Parts Revenue',
        current: Math.round(currentPartsRevenue),
        previous: Math.round(previousPartsRevenue),
        change: calculateChange(currentPartsRevenue, previousPartsRevenue)
      },
      {
        name: 'Average Ticket',
        current: Math.round(currentAvgTicket),
        previous: Math.round(previousAvgTicket),
        change: calculateChange(currentAvgTicket, previousAvgTicket)
      }
    ];
    
    // Service metrics comparison
    const currentCompletionRate = currentWorkOrders.filter((o: any) => o.status === 'completed').length / 
                                 (currentWorkOrders.length || 1) * 100;
    const previousCompletionRate = previousWorkOrders.filter((o: any) => o.status === 'completed').length / 
                                  (previousWorkOrders.length || 1) * 100;
    
    // For demo purposes, generate some random but reasonable metrics
    const serviceComparison: ComparisonReportData[] = [
      {
        name: 'Work Orders',
        current: currentWorkOrders.length,
        previous: previousWorkOrders.length,
        change: calculateChange(currentWorkOrders.length, previousWorkOrders.length)
      },
      {
        name: 'Completion Rate',
        current: Math.round(currentCompletionRate),
        previous: Math.round(previousCompletionRate),
        change: calculateChange(currentCompletionRate, previousCompletionRate)
      },
      {
        name: 'On-Time Rate',
        current: 85, // These would be calculated from real data in a production app
        previous: 82,
        change: 4
      },
      {
        name: 'Customer Satisfaction',
        current: 4.8, // These would be calculated from real feedback data
        previous: 4.6,
        change: 4
      }
    ];
    
    return { revenueComparison, serviceComparison };
  };

  // Helper function to fetch inventory data
  const fetchInventoryData = async () => {
    // Fetch inventory items
    const { data: inventoryItems, error } = await supabase
      .from('inventory_items')
      .select('id, name, quantity, reorder_point, status');
    
    if (error) throw error;
    
    // Calculate inventory status distribution
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockItems = [];
    
    for (const item of inventoryItems) {
      if (item.quantity <= 0) {
        outOfStockCount++;
        lowStockItems.push({
          name: item.name,
          currentStock: 0,
          reorderLevel: item.reorder_point,
          status: 'Out of Stock'
        });
      } else if (item.quantity <= item.reorder_point) {
        lowStockCount++;
        lowStockItems.push({
          name: item.name,
          currentStock: item.quantity,
          reorderLevel: item.reorder_point,
          status: 'Low Stock'
        });
      } else {
        inStockCount++;
      }
    }
    
    // Status data for pie chart
    const statusData = [
      { name: 'In Stock', value: inStockCount, color: '#10b981' },
      { name: 'Low Stock', value: lowStockCount, color: '#f97316' },
      { name: 'Out of Stock', value: outOfStockCount, color: '#ef4444' },
    ];
    
    // Generate turnover data (this would be calculated from historical inventory movements in a real app)
    const turnoverData = [
      { month: 'Jan', turnover: 3.2 },
      { month: 'Feb', turnover: 3.4 },
      { month: 'Mar', turnover: 3.8 },
      { month: 'Apr', turnover: 3.5 },
      { month: 'May', turnover: 3.9 },
      { month: 'Jun', turnover: 4.2 },
    ];
    
    return {
      statusData,
      turnoverData,
      lowStockItems: lowStockItems.slice(0, 4) // Show only top 4 for UI purposes
    };
  };

  // Helper function to format time
  const formatTime = (date: Date): string => {
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
  }, [timeframe, JSON.stringify(filters), fetchReportData]);

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
