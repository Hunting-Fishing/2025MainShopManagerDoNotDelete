
import { Customer } from "@/types/customer";
import { supabase } from "@/lib/supabase";

/**
 * Calculate customer lifetime value based on their purchase history
 */
export const calculateCustomerLifetimeValue = async (customerId: string): Promise<number> => {
  try {
    // Get all invoices for this customer
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('customer_id', customerId);
      
    if (error) {
      console.error("Error fetching invoices for CLV calculation:", error);
      throw error;
    }
    
    // Sum up all invoice amounts
    return invoices?.reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0), 0) || 0;
  } catch (error) {
    console.error("Error calculating customer lifetime value:", error);
    return 0;
  }
};

/**
 * Get number of years customer has been active
 */
export const getCustomerTenure = async (customerId: string): Promise<number> => {
  try {
    // Get customer creation date
    const { data: customer, error } = await supabase
      .from('customers')
      .select('created_at')
      .eq('id', customerId)
      .single();
      
    if (error || !customer) {
      console.error("Error fetching customer for tenure calculation:", error);
      return 0;
    }
    
    const creationDate = new Date(customer.created_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - creationDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.max(diffYears, 0.1); // Minimum tenure of 0.1 years to avoid division by zero
  } catch (error) {
    console.error("Error calculating customer tenure:", error);
    return 0.1; // Default to 0.1 years
  }
};

/**
 * Get customer CLV percentile compared to all other customers
 */
export const getCustomerLifetimeValuePercentile = async (customerId: string): Promise<number> => {
  try {
    // Get current customer's CLV
    const customerClv = await calculateCustomerLifetimeValue(customerId);
    if (customerClv === 0) return 0;
    
    // Get all customers CLVs
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id');
      
    if (error) {
      console.error("Error fetching customers for percentile calculation:", error);
      throw error;
    }
    
    // Calculate CLV for each customer and count how many have lower CLV
    let lowerCount = 0;
    let totalCount = customers?.length || 1; // Avoid division by zero
    
    for (const customer of (customers || [])) {
      if (customer.id === customerId) continue; // Skip current customer
      
      const otherClv = await calculateCustomerLifetimeValue(customer.id);
      if (otherClv < customerClv) {
        lowerCount++;
      }
    }
    
    // Calculate percentile
    return Math.round((lowerCount / (totalCount - 1)) * 100);
  } catch (error) {
    console.error("Error calculating customer CLV percentile:", error);
    return 0;
  }
};

/**
 * Get average CLV across all customers
 */
export const getAverageCustomerLifetimeValue = async (): Promise<number> => {
  try {
    // Get all customers
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id');
      
    if (error || !customers || customers.length === 0) {
      console.error("Error fetching customers for average CLV calculation:", error);
      return 0;
    }
    
    // Calculate CLV for each customer
    let totalClv = 0;
    for (const customer of customers) {
      const clv = await calculateCustomerLifetimeValue(customer.id);
      totalClv += clv;
    }
    
    // Calculate average
    return totalClv / customers.length;
  } catch (error) {
    console.error("Error calculating average CLV:", error);
    return 0;
  }
};

/**
 * Predict future customer value based on past performance
 */
export const predictFutureCustomerValue = async (customerId: string): Promise<number> => {
  try {
    // Fetch the customer first
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
      
    if (error || !customer) {
      console.error("Error fetching customer for future value prediction:", error);
      return 0;
    }
    
    // Get current lifetime value
    const currentValue = await calculateCustomerLifetimeValue(customerId);
    
    // Get customer tenure
    const tenure = await getCustomerTenure(customerId);
    
    // Calculate average annual value
    const annualValue = currentValue / tenure;
    
    // Predict future value (next 3 years)
    const futureYears = 3;
    const retentionRate = 0.85; // Assume 85% retention rate
    let futureValue = 0;
    
    for (let year = 1; year <= futureYears; year++) {
      futureValue += annualValue * Math.pow(retentionRate, year);
    }
    
    return parseFloat((currentValue + futureValue).toFixed(2));
  } catch (error) {
    console.error("Error predicting future customer value:", error);
    return 0;
  }
};

/**
 * Get an array of customers with their segment information
 */
export const getCustomersWithSegments = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
      
    if (error) throw error;
    
    const customers = data as Customer[];
    
    // Add CLV to each customer
    for (const customer of customers) {
      const clvValue = await calculateCustomerLifetimeValue(customer.id);
      customer.clv = clvValue;
    }
    
    return customers;
  } catch (error) {
    console.error('Error fetching customers with segments:', error);
    return [];
  }
};

export interface CustomerSegmentType {
  id: string;
  name: string;
  description: string;
  color: string;
}

/**
 * Get all customer segments defined in the system
 */
export const getCustomerSegments = async (): Promise<CustomerSegmentType[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_segments')
      .select('*');
      
    if (error) throw error;
    
    return data as CustomerSegmentType[];
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    return [];
  }
};
