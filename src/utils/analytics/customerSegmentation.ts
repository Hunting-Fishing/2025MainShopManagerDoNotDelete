
import { supabase } from "@/integrations/supabase/client";

/**
 * Calculate customer retention risk score (0-100)
 * Higher score means higher risk of losing the customer
 */
export const calculateRetentionRiskScore = async (customerId: string): Promise<number | null> => {
  try {
    // Get the customer's service history
    const { data: workOrders, error: workOrderError } = await supabase
      .from("work_orders")
      .select("created_at, total_cost")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (workOrderError) {
      console.error("Error fetching work orders for retention analysis:", workOrderError);
      return null;
    }

    // If no service history, high risk (80%)
    if (!workOrders || workOrders.length === 0) {
      return 80;
    }

    // Calculate time since last service
    const lastServiceDate = new Date(workOrders[0].created_at);
    const daysSinceLastService = Math.floor((new Date().getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Base risk starts at 30%
    let riskScore = 30;
    
    // Increase risk based on time since last service
    if (daysSinceLastService > 365) { // More than a year
      riskScore += 50;
    } else if (daysSinceLastService > 180) { // More than 6 months
      riskScore += 30;
    } else if (daysSinceLastService > 90) { // More than 3 months
      riskScore += 15;
    }
    
    // Reduce risk based on service frequency
    if (workOrders.length >= 3) {
      riskScore -= 20;
    } else if (workOrders.length >= 2) {
      riskScore -= 10;
    }
    
    // Adjust for total spend
    const totalSpend = workOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0);
    if (totalSpend > 2000) {
      riskScore -= 15;
    } else if (totalSpend > 1000) {
      riskScore -= 10;
    } else if (totalSpend > 500) {
      riskScore -= 5;
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, riskScore));
  } catch (error) {
    console.error("Error calculating retention risk:", error);
    return null;
  }
};

/**
 * Analyze customer segments based on behavior and characteristics
 */
export const analyzeCustomerSegments = async (customerId: string): Promise<string[]> => {
  try {
    // First check if customer has segments assigned in the database
    const { data: segmentAssignments, error: segmentError } = await supabase
      .from("customer_segment_assignments")
      .select("segment_id")
      .eq("customer_id", customerId);
      
    if (segmentError) {
      console.error("Error fetching customer segments:", segmentError);
    } else if (segmentAssignments && segmentAssignments.length > 0) {
      // Get segment names
      const segmentIds = segmentAssignments.map(sa => sa.segment_id);
      const { data: segments } = await supabase
        .from("customer_segments")
        .select("name")
        .in("id", segmentIds);
        
      if (segments && segments.length > 0) {
        return segments.map(s => s.name.toLowerCase().replace(/\s+/g, '_'));
      }
    }
    
    // If no segments assigned or error, calculate basic segments
    // Get customer data to analyze
    const { data: customer } = await supabase
      .from("customers")
      .select("created_at")
      .eq("id", customerId)
      .single();
      
    const { data: workOrders } = await supabase
      .from("work_orders")
      .select("id, created_at, total_cost")
      .eq("customer_id", customerId);
      
    const segments: string[] = [];
    
    // New customer segment (less than 90 days)
    if (customer) {
      const customerSince = new Date(customer.created_at);
      const daysSinceCreation = Math.floor((new Date().getTime() - customerSince.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation <= 90) {
        segments.push("new");
      }
    }
    
    // No work orders = inactive
    if (!workOrders || workOrders.length === 0) {
      segments.push("inactive");
      return segments;
    }
    
    // Check for loyalty - 3+ work orders
    if (workOrders.length >= 3) {
      segments.push("loyal");
    }
    
    // Last service date
    const lastServiceDate = new Date(workOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      .created_at);
      
    const daysSinceLastService = Math.floor((new Date().getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Inactive (1+ years)
    if (daysSinceLastService > 365) {
      segments.push("inactive");
    } else if (daysSinceLastService > 180) {
      segments.push("at_risk");
    }
    
    // Value segments
    const totalSpend = workOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0);
    if (totalSpend > 2000) {
      segments.push("high_value");
    } else if (totalSpend > 1000) {
      segments.push("medium_value");
    } else {
      segments.push("low_value");
    }
    
    return segments;
  } catch (error) {
    console.error("Error analyzing customer segments:", error);
    return [];
  }
};
