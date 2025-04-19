
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
 * Predict future customer value based on past performance
 */
export const predictFutureCustomerValue = async (customer: Customer): Promise<number> => {
  try {
    // Get current lifetime value
    const currentValue = await calculateCustomerLifetimeValue(customer.id);
    
    // Get customer tenure
    const tenure = await getCustomerTenure(customer.id);
    
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
      customer.clv = await calculateCustomerLifetimeValue(customer.id);
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
