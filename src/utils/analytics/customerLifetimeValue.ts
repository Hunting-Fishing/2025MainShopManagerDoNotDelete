
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

/**
 * Calculate the customer's lifetime value based on their purchase history
 * @param customerId The ID of the customer
 * @returns The calculated lifetime value
 */
export const calculateCustomerLifetimeValue = async (customerId: string): Promise<number> => {
  try {
    // First, check if the customer already has CLV stored in the customer_loyalty table
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from("customer_loyalty")
      .select("lifetime_value")
      .eq("customer_id", customerId)
      .single();
      
    if (loyaltyData && !loyaltyError && loyaltyData.lifetime_value) {
      return parseFloat(loyaltyData.lifetime_value.toString());
    }
    
    // If not in loyalty table, calculate from invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("total")
      .eq("customer_id", customerId);
      
    if (invoicesError) {
      console.error("Error fetching customer invoices for CLV calculation:", invoicesError);
      return 0;
    }
    
    // Sum all invoice totals
    const lifetimeValue = invoices?.reduce((sum, invoice) => {
      return sum + (parseFloat(invoice.total?.toString() || '0') || 0);
    }, 0) || 0;
    
    return lifetimeValue;
  } catch (error) {
    console.error("Error calculating customer lifetime value:", error);
    return 0;
  }
};

/**
 * Get the percentile rank of a customer's lifetime value compared to all customers
 * @param customerId The ID of the customer
 * @returns The percentile (0-100)
 */
export const getCustomerLifetimeValuePercentile = async (customerId: string): Promise<number> => {
  try {
    const clv = await calculateCustomerLifetimeValue(customerId);
    
    // If we have no value, return 0 percentile
    if (clv === 0) return 0;
    
    // Get all customer lifetime values for comparison
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from("customer_loyalty")
      .select("lifetime_value");
      
    if (loyaltyError) {
      console.error("Error fetching loyalty data for percentile calculation:", loyaltyError);
      return 50; // Default to middle percentile on error
    }
    
    // Extract all CLV values and sort them
    const allValues = (loyaltyData || [])
      .map(item => parseFloat(item.lifetime_value?.toString() || '0') || 0)
      .sort((a, b) => a - b);
    
    // Find how many values are less than the current customer's CLV
    const lessThanCount = allValues.filter(value => value < clv).length;
    
    // Calculate percentile
    if (allValues.length === 0) return 50; // Default if no values
    
    const percentile = Math.round((lessThanCount / allValues.length) * 100);
    return percentile;
  } catch (error) {
    console.error("Error calculating CLV percentile:", error);
    return 50; // Default to middle percentile on error
  }
};

/**
 * Predict the future value of a customer based on historical data and trends
 * @param customerId The ID of the customer
 * @returns The predicted future value
 */
export const predictFutureCustomerValue = async (customerId: string): Promise<number> => {
  try {
    const currentValue = await calculateCustomerLifetimeValue(customerId);
    
    // Get customer's purchase history to analyze frequency
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("total, date")
      .eq("customer_id", customerId)
      .order("date", { ascending: false });
      
    if (invoicesError) {
      console.error("Error fetching customer invoice history:", invoicesError);
      // Simple prediction - 20% growth
      return currentValue * 1.2;
    }
    
    // If they have no purchase history, make a simple prediction
    if (!invoices || invoices.length === 0) {
      return currentValue * 1.2; // Simple 20% growth assumption
    }
    
    // Analyze purchase frequency and recency for more advanced prediction
    const invoiceCount = invoices.length;
    const timeSpan = invoiceCount > 1 
      ? (new Date().getTime() - new Date(invoices[invoiceCount-1].date).getTime()) / (1000 * 3600 * 24 * 365)
      : 1; // Default to 1 year if only one invoice
    
    const purchaseFrequency = invoiceCount / (timeSpan || 1);
    
    // Calculate recency factor - more recent purchases suggest higher future value
    const mostRecentDate = new Date(invoices[0].date).getTime();
    const daysSinceLastPurchase = (new Date().getTime() - mostRecentDate) / (1000 * 3600 * 24);
    const recencyFactor = Math.max(0.8, 1 - (daysSinceLastPurchase / 365)); // Range from 0.8 to 1.0
    
    // Calculate average invoice value
    const avgValue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0') || 0), 0) / invoiceCount;
    
    // Predict future value based on current value with adjustments for frequency and recency
    const growthMultiplier = 1 + (0.1 * Math.min(purchaseFrequency, 5) * recencyFactor);
    return currentValue * growthMultiplier;
  } catch (error) {
    console.error("Error predicting future customer value:", error);
    return await calculateCustomerLifetimeValue(customerId) * 1.2; // Fall back to simple prediction
  }
};

/**
 * Get customers with their associated segments
 */
export const getCustomersWithSegments = async () => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*,loyalty:customer_loyalty(*)');
    
    if (error) {
      throw error;
    }
    
    // Calculate segments for each customer
    const customersWithCLV = await Promise.all(customers.map(async (customer) => {
      // Ensure segments is at least an array
      customer.segments = customer.segments || [];
      
      // Calculate CLV and add it to customer object
      const clv = await calculateCustomerLifetimeValue(customer.id);
      return {
        ...customer,
        clv
      };
    }));
    
    return customersWithCLV;
  } catch (error) {
    console.error('Error fetching customers with segments:', error);
    return [];
  }
};

/**
 * Get the average customer lifetime value across all customers
 */
export const getAverageCustomerLifetimeValue = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('lifetime_value');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return 0;
    }
    
    const sum = data.reduce((total, record) => {
      return total + (parseFloat(record.lifetime_value?.toString() || '0') || 0);
    }, 0);
    
    return sum / data.length;
  } catch (error) {
    console.error('Error calculating average CLV:', error);
    return 0;
  }
};
