
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ReportData {
  salesData: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
  workOrderStatusData: {
    name: string;
    value: number;
    color: string;
  }[];
  topSellingItems: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  servicePerformance: {
    month: string;
    completedOnTime: number;
    delayed: number;
  }[];
  comparisonRevenueData: {
    name: string;
    current: number;
    previous: number;
    change: number;
  }[];
  comparisonServiceData: {
    name: string;
    current: number;
    previous: number;
    change: number;
  }[];
  inventoryData: {
    statusData: {
      name: string;
      value: number;
      color: string;
    }[];
    turnoverData: {
      month: string;
      turnover: number;
    }[];
    lowStockItems: {
      name: string;
      currentStock: number;
      reorderLevel: number;
      status: string;
    }[];
  };
}

export function useReportData(dateRange: { start: Date; end: Date } = {
  start: new Date(new Date().setDate(1)),  // First day of current month
  end: new Date()                          // Today
}) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData(dateRange);
  }, [dateRange]);

  const fetchReportData = async (range: { start: Date; end: Date }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get work order status counts
      const { data: workOrderStatusData, error: workOrderStatusError } = await supabase
        .from('work_orders')
        .select('status, count')
        .select('status')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());
        
      if (workOrderStatusError) throw workOrderStatusError;
      
      // Count the different statuses
      const statusCounts: Record<string, number> = {};
      workOrderStatusData.forEach(wo => {
        statusCounts[wo.status] = (statusCounts[wo.status] || 0) + 1;
      });
      
      // Format the status data for display
      const statusColors: Record<string, string> = {
        'completed': '#0ea5e9',
        'in_progress': '#f97316',
        'pending': '#8b5cf6',
        'cancelled': '#ef4444',
        'on_hold': '#84cc16'
      };
      
      const workOrderStatusChartData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value,
        color: statusColors[name] || '#9ca3af'
      }));

      // Get inventory status
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*');

      if (inventoryError) throw inventoryError;
      
      // Process inventory data
      const inStockCount = inventoryData.filter(item => item.quantity > item.reorder_point).length;
      const lowStockCount = inventoryData.filter(item => item.quantity <= item.reorder_point && item.quantity > 0).length;
      const outOfStockCount = inventoryData.filter(item => item.quantity <= 0).length;
      
      const inventoryStatusData = [
        { name: 'In Stock', value: inStockCount, color: '#10b981' },
        { name: 'Low Stock', value: lowStockCount, color: '#f97316' },
        { name: 'Out of Stock', value: outOfStockCount, color: '#ef4444' },
      ];
      
      // Get low stock items
      const lowStockItems = inventoryData
        .filter(item => item.quantity <= item.reorder_point)
        .map(item => ({
          name: item.name,
          currentStock: item.quantity,
          reorderLevel: item.reorder_point,
          status: item.quantity <= 0 ? 'Out of Stock' : 'Low Stock'
        }))
        .slice(0, 5);  // Get top 5

      // Generate monthly sales data (simulated from invoices)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesData = months.map(month => ({
        month,
        // Placeholder values - in a real app, this would come from invoice data
        revenue: Math.floor(Math.random() * 5000) + 1000,
        expenses: Math.floor(Math.random() * 3000) + 500
      }));

      // Top selling items/services (placeholder)
      const topItems = [
        { id: 1, name: 'Oil Change Service', quantity: 120, revenue: 3600 },
        { id: 2, name: 'Brake Pad Replacement', quantity: 85, revenue: 8500 },
        { id: 3, name: 'Tire Rotation', quantity: 78, revenue: 1950 },
        { id: 4, name: 'Engine Tune-up', quantity: 65, revenue: 9750 },
        { id: 5, name: 'Air Filter Replacement', quantity: 62, revenue: 1240 },
      ];

      // Assemble the report data
      const reportData: ReportData = {
        salesData,
        workOrderStatusData: workOrderStatusChartData,
        topSellingItems: topItems,
        servicePerformance: months.slice(0, 6).map(month => ({
          month,
          completedOnTime: Math.floor(Math.random() * 30) + 40,
          delayed: Math.floor(Math.random() * 5) + 2
        })),
        comparisonRevenueData: [
          { name: 'Total Revenue', current: 35890, previous: 30450, change: 18 },
          { name: 'Service Revenue', current: 28500, previous: 24100, change: 18 },
          { name: 'Parts Revenue', current: 7390, previous: 6350, change: 16 },
          { name: 'Average Ticket', current: 450, previous: 410, change: 10 }
        ],
        comparisonServiceData: [
          { name: 'Work Orders', current: workOrderStatusData.length, previous: Math.floor(workOrderStatusData.length * 0.9), change: 10 },
          { name: 'Completion Rate', current: 92, previous: 88, change: 5 },
          { name: 'On-Time Rate', current: 85, previous: 82, change: 4 },
          { name: 'Customer Satisfaction', current: 4.8, previous: 4.6, change: 4 }
        ],
        inventoryData: {
          statusData: inventoryStatusData,
          turnoverData: months.slice(0, 6).map(month => ({
            month,
            turnover: Math.random() * 1 + 3  // Random value between 3-4
          })),
          lowStockItems
        }
      };
      
      setReportData(reportData);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  return { reportData, isLoading, error, fetchReportData };
}
