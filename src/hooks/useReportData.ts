
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ReportData {
  // General metrics
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  
  // Revenue by period
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    target?: number;
  }>;
  
  // Service data
  revenueByService: Array<{
    name: string;
    revenue: number;
    count: number;
  }>;
  
  // Customer data
  customerRetention: Array<{
    month: string;
    rate: number;
  }>;
  customersBySource: Array<{
    source: string;
    value: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    revenue: number;
  }>;
}

export function useReportData() {
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    revenueByPeriod: [],
    revenueByService: [],
    customerRetention: [],
    customersBySource: [],
    topCustomers: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReportData = useCallback(async (range: { start: Date; end: Date }) => {
    setIsLoading(true);
    setError('');

    try {
      // Get invoice data for the specified date range
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .filter('date', '>=', range.start.toISOString().split('T')[0])
        .filter('date', '<=', range.end.toISOString().split('T')[0]);

      if (invoiceError) {
        throw new Error(invoiceError.message);
      }

      // Calculate total revenue
      const totalRevenue = invoiceData?.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0) || 0;
      
      // Calculate total orders and average order value
      const totalOrders = invoiceData?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group revenue by period (month)
      const revenueByMonth = {};
      invoiceData?.forEach(invoice => {
        const date = new Date(invoice.date);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = 0;
        }
        
        revenueByMonth[month] += Number(invoice.total) || 0;
      });

      const revenueByPeriod = Object.entries(revenueByMonth).map(([period, revenue]) => ({
        period,
        revenue: Number(revenue),
        target: Number(revenue) * 1.1 // 10% higher than actual as a mock target
      }));

      // Mock data for service revenue
      const serviceTypes = [
        'Oil Change',
        'Brake Service',
        'Tire Replacement',
        'Engine Repair',
        'Transmission',
        'Electrical',
        'Diagnostics',
        'General Maintenance'
      ];
      
      const revenueByService = serviceTypes.map(service => ({
        name: service,
        revenue: Math.floor(Math.random() * 10000) + 1000,
        count: Math.floor(Math.random() * 50) + 10
      })).sort((a, b) => b.revenue - a.revenue);

      // Mock data for customer retention
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const customerRetention = months.map(month => ({
        month,
        rate: Math.floor(Math.random() * 30) + 70 // 70-99%
      }));

      // Mock data for customers by source
      const sources = ['Referral', 'Google', 'Social Media', 'Direct', 'Other'];
      const customersBySource = sources.map(source => ({
        source,
        value: Math.floor(Math.random() * 100) + 20
      }));

      // Mock data for top customers
      const topCustomers = Array.from({ length: 5 }, (_, i) => ({
        id: `cust-${i + 1}`,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        revenue: Math.floor(Math.random() * 10000) + 1000
      })).sort((a, b) => b.revenue - a.revenue);

      setReportData({
        totalRevenue,
        averageOrderValue,
        totalOrders,
        revenueByPeriod,
        revenueByService,
        customerRetention,
        customersBySource,
        topCustomers
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    
    fetchReportData({ start, end });
  }, [fetchReportData]);

  return { reportData, isLoading, error, fetchReportData };
}
