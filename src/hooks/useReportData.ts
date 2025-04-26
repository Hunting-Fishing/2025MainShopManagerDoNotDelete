
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useShopId } from './useShopId';
import { format } from 'date-fns';

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export function useReportData() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [workOrdersData, setWorkOrdersData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { shopId } = useShopId();
  
  // Helper to get date ranges
  const getDateRange = (period: 'week' | 'month' | 'year') => {
    const now = new Date();
    let start = new Date();
    
    if (period === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      start.setFullYear(now.getFullYear() - 1);
    }
    
    return {
      start: formatDate(start),
      end: formatDate(now)
    };
  };

  // Fetch revenue data for a given period
  const fetchRevenueData = async (period: 'week' | 'month' | 'year') => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(period);
      
      // Fetch invoice data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('date, total, status')
        .gte('date', start)
        .lte('date', end)
        .eq('status', 'paid');
      
      if (invoicesError) throw invoicesError;
      
      // Process data for chart display
      const processedData = processDataByDate(invoices || []);
      setRevenueData(processedData);
      return processedData;
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Failed to load revenue data");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch work orders data for a given period
  const fetchWorkOrdersData = async (period: 'week' | 'month' | 'year') => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(period);
      
      // Fetch work orders data
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('created_at, status')
        .gte('created_at', start)
        .lte('created_at', end);
      
      if (workOrdersError) throw workOrdersError;
      
      // Process data for chart display
      const processedData = processWorkOrdersByStatus(workOrders || []);
      setWorkOrdersData(processedData);
      return processedData;
    } catch (err) {
      console.error("Error fetching work orders data:", err);
      setError("Failed to load work orders data");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory items data
      const { data: items, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('quantity', { ascending: true })
        .limit(10);
      
      if (inventoryError) throw inventoryError;
      
      const processedData = items || [];
      setInventoryData(processedData);
      return processedData;
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch top customers by revenue
  const fetchTopCustomers = async (limit: number = 5) => {
    try {
      setLoading(true);
      
      // Call the RPC function
      const { data, error } = await supabase
        .rpc('get_top_customers_by_revenue_func', { limit_count: limit })
        .select();
      
      if (error) throw error;
      
      // Ensure data is an array before setting state
      const customersData = Array.isArray(data) ? data : [];
      setTopCustomers(customersData);
      return customersData;
    } catch (err) {
      console.error("Error fetching top customers:", err);
      setError("Failed to load top customers data");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process data by date for charts
  const processDataByDate = (data: any[]) => {
    const dataByDate: {[key: string]: number} = {};
    
    data.forEach(item => {
      const date = item.date.split('T')[0]; // Extract just the date part
      const amount = parseFloat(item.total || 0);
      
      if (dataByDate[date]) {
        dataByDate[date] += amount;
      } else {
        dataByDate[date] = amount;
      }
    });
    
    // Convert to array format for charts
    return Object.keys(dataByDate).map(date => ({
      date,
      amount: dataByDate[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Helper function to process work orders by status
  const processWorkOrdersByStatus = (data: any[]) => {
    const statusCounts: {[key: string]: number} = {};
    
    data.forEach(item => {
      const status = item.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Convert to array format for charts
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  };
  
  return {
    revenueData,
    workOrdersData,
    inventoryData,
    topCustomers,
    loading,
    error,
    fetchRevenueData,
    fetchWorkOrdersData,
    fetchInventoryData,
    fetchTopCustomers
  };
}
