
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface RevenueData {
  date: string;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
}

/**
 * Get revenue data for the last 30 days
 */
export const getRevenueData = async (days = 30): Promise<RevenueData[]> => {
  try {
    // Query invoices for the last X days
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const { data, error } = await supabase
      .from('invoices')
      .select('date, total')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }

    // Process data to get daily revenue
    const revenueByDate: { [date: string]: number } = {};
    
    // Initialize all dates in the range with zero revenue
    for (let i = 0; i <= days; i++) {
      const date = format(subDays(endDate, days - i), 'yyyy-MM-dd');
      revenueByDate[date] = 0;
    }
    
    // Sum revenues for each day
    data.forEach(item => {
      const date = String(item.date).substring(0, 10); // Format as YYYY-MM-DD
      const amount = typeof item.total === 'number' ? item.total : parseFloat(String(item.total) || '0');
      
      if (revenueByDate[date] !== undefined) {
        revenueByDate[date] += amount;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2))
    }));
  } catch (error) {
    console.error('Error in getRevenueData:', error);
    return [];
  }
};

/**
 * Get total revenue for the current month
 */
export const getCurrentMonthRevenue = async (): Promise<number> => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('invoices')
      .select('total')
      .gte('date', format(firstDayOfMonth, 'yyyy-MM-dd'))
      .lte('date', format(now, 'yyyy-MM-dd'));
      
    if (error) {
      console.error('Error fetching current month revenue:', error);
      throw error;
    }
    
    const total = data.reduce((sum, invoice) => {
      const amount = typeof invoice.total === 'number' ? invoice.total : parseFloat(String(invoice.total) || '0');
      return sum + amount;
    }, 0);
    
    return Number(total.toFixed(2));
  } catch (error) {
    console.error('Error in getCurrentMonthRevenue:', error);
    return 0;
  }
};

/**
 * Get revenue by service category
 */
export const getRevenueByCategory = async (): Promise<CategoryData[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('total_cost, service_category_id, service_categories!inner(name)')
      .not('service_category_id', 'is', null);
      
    if (error) {
      console.error('Error fetching revenue by category:', error);
      throw error;
    }
    
    // Group and sum by category
    const categoryMap = new Map<string, number>();
    
    data.forEach(workOrder => {
      const categoryName = workOrder.service_categories?.name || 'Uncategorized';
      const amount = typeof workOrder.total_cost === 'number' ? 
        workOrder.total_cost : 
        parseFloat(String(workOrder.total_cost) || '0');
        
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, 0);
      }
      
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
    });
    
    // Convert to array format for chart
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  } catch (error) {
    console.error('Error in getRevenueByCategory:', error);
    return [];
  }
};
