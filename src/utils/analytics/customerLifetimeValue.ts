
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";

/**
 * Calculates a customer's lifetime value based on their transaction history
 * CLV = Average Purchase Value × Average Purchase Frequency × Average Customer Lifespan
 */
export const calculateCustomerLifetimeValue = async (customerId: string): Promise<number | null> => {
  try {
    // Get customer loyalty data which already contains lifetime value
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from("customer_loyalty")
      .select("lifetime_value")
      .eq("customer_id", customerId)
      .single();
    
    if (loyaltyError && loyaltyError.code !== 'PGRST116') {
      console.error("Error fetching customer loyalty data:", loyaltyError);
      return null;
    }

    // If we have direct lifetime value data, return it
    if (loyaltyData?.lifetime_value) {
      return loyaltyData.lifetime_value;
    }

    // Otherwise, calculate from work orders and invoices
    const { data: workOrders, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("id, total_cost, created_at")
      .eq("customer_id", customerId);
    
    if (workOrdersError) {
      console.error("Error fetching work order data:", workOrdersError);
      return null;
    }
    
    if (!workOrders || workOrders.length === 0) {
      return 0; // No purchase history yet
    }
    
    // Calculate average order value
    const totalSpent = workOrders.reduce((sum, order) => 
      sum + (order.total_cost || 0), 0);
    const averageOrderValue = totalSpent / workOrders.length;
    
    // Calculate purchase frequency (purchases per year)
    const firstOrderDate = new Date(workOrders
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
      .created_at);
    const lastOrderDate = new Date(workOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      .created_at);
    
    // Calculate time span in years
    const timeSpanMs = lastOrderDate.getTime() - firstOrderDate.getTime();
    const timeSpanYears = Math.max(timeSpanMs / (1000 * 60 * 60 * 24 * 365), 0.08); // Minimum of ~1 month
    
    const purchaseFrequency = workOrders.length / timeSpanYears;
    
    // For a simple model, estimate customer lifespan at 3 years if less than 1 year of history,
    // otherwise use 2× the current relationship length
    const customerLifespan = timeSpanYears < 1 ? 3 : timeSpanYears * 2;
    
    // Calculate and return CLV
    const clv = averageOrderValue * purchaseFrequency * customerLifespan;
    return Math.round(clv * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error("Error calculating customer lifetime value:", error);
    return null;
  }
};

/**
 * Get average customer lifetime value across all customers
 */
export const getAverageCustomerLifetimeValue = async (): Promise<number | null> => {
  try {
    // Try to get average from loyalty data
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from("customer_loyalty")
      .select("lifetime_value");
    
    if (loyaltyError) {
      console.error("Error fetching customer loyalty data:", loyaltyError);
      return null;
    }
    
    if (loyaltyData && loyaltyData.length > 0) {
      const totalValue = loyaltyData.reduce((sum, customer) => 
        sum + (customer.lifetime_value || 0), 0);
      return totalValue / loyaltyData.length;
    }
    
    return null;
  } catch (error) {
    console.error("Error calculating average customer lifetime value:", error);
    return null;
  }
};

/**
 * Get customer lifetime value percentile for a specific customer
 */
export const getCustomerLifetimeValuePercentile = async (customerId: string): Promise<number | null> => {
  try {
    const customerCLV = await calculateCustomerLifetimeValue(customerId);
    
    if (customerCLV === null) return null;
    
    // Get all customers' lifetime values
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from("customer_loyalty")
      .select("lifetime_value")
      .order("lifetime_value", { ascending: true });
    
    if (loyaltyError) {
      console.error("Error fetching customer loyalty data:", loyaltyError);
      return null;
    }
    
    if (!loyaltyData || loyaltyData.length === 0) return null;
    
    // Filter out null values and sort
    const sortedValues = loyaltyData
      .filter(c => c.lifetime_value !== null)
      .map(c => c.lifetime_value)
      .sort((a, b) => a - b);
    
    if (sortedValues.length === 0) return null;
    
    // Find percentile position
    let position = 0;
    while (position < sortedValues.length && sortedValues[position] < customerCLV) {
      position++;
    }
    
    return Math.round((position / sortedValues.length) * 100);
  } catch (error) {
    console.error("Error calculating customer lifetime value percentile:", error);
    return null;
  }
};

/**
 * Predicts future customer lifetime value based on historical data
 * and growth patterns (12-month projection by default)
 */
export const predictFutureCustomerValue = async (customerId: string, timeframeMonths: number = 12): Promise<number | null> => {
  try {
    // Get current CLV
    const currentClv = await calculateCustomerLifetimeValue(customerId);
    if (currentClv === null) return null;
    
    // Get customer history to determine patterns
    const { data: workOrders, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("id, created_at, total_cost, status")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: true });
    
    if (workOrdersError) {
      console.error("Error fetching work order data for prediction:", workOrdersError);
      return null;
    }
    
    if (!workOrders || workOrders.length === 0) {
      // No history - use default prediction factor (20% increase)
      return currentClv * 1.2;
    }
    
    // Analyze growth rate over time
    // Group orders by quarters
    const quarterlyData: Record<string, number> = {};
    workOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const quarter = `${orderDate.getFullYear()}-Q${Math.floor(orderDate.getMonth() / 3) + 1}`;
      
      if (!quarterlyData[quarter]) {
        quarterlyData[quarter] = 0;
      }
      
      quarterlyData[quarter] += order.total_cost || 0;
    });
    
    // Convert to array and sort chronologically
    const quarters = Object.keys(quarterlyData).sort();
    
    // If we have at least 2 quarters of data, calculate growth rate
    if (quarters.length >= 2) {
      const oldestQuarterValue = quarterlyData[quarters[0]];
      const newestQuarterValue = quarterlyData[quarters[quarters.length - 1]];
      
      // Calculate quarterly growth rate
      const numQuarters = quarters.length - 1;
      const quarterlyGrowthRate = Math.pow(newestQuarterValue / oldestQuarterValue, 1 / numQuarters) - 1;
      
      // Calculate projected value based on timeframe
      const projectedQuarters = timeframeMonths / 3;
      return currentClv * Math.pow(1 + quarterlyGrowthRate, projectedQuarters);
    }
    
    // Default growth prediction if insufficient historical data
    return currentClv * 1.25;
    
  } catch (error) {
    console.error("Error predicting future customer value:", error);
    return null;
  }
};
