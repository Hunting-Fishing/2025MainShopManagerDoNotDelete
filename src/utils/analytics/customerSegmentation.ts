
import { supabase } from "@/integrations/supabase/client";
import { calculateCustomerLifetimeValue } from "./customerLifetimeValue";

// Define the valid segment types as a union type
export type CustomerSegmentType = 
  'high_value' | 
  'medium_value' | 
  'low_value' | 
  'new' | 
  'at_risk' | 
  'loyal' | 
  'inactive';

/**
 * Analyze a customer and determine which segments they belong to
 * @param customerId The ID of the customer to analyze
 * @returns Array of segment identifiers the customer belongs to
 */
export const analyzeCustomerSegments = async (customerId: string): Promise<CustomerSegmentType[]> => {
  try {
    // Fetch customer data
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
      
    if (customerError) {
      console.error("Error fetching customer for segmentation:", customerError);
      return [];
    }
    
    // Fetch work orders to analyze service history
    const { data: workOrders, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
      
    if (workOrdersError) {
      console.error("Error fetching work orders for segmentation:", workOrdersError);
      // Continue without work orders data
    }
    
    // Fetch invoices for monetary analysis
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .eq("customer_id", customerId);
      
    if (invoicesError) {
      console.error("Error fetching invoices for segmentation:", invoicesError);
      // Continue without invoices data
    }
    
    const segments: CustomerSegmentType[] = [];
    
    // Calculate lifetime value
    const lifetimeValue = await calculateCustomerLifetimeValue(customerId);
    
    // Determine value-based segment
    if (lifetimeValue >= 1000) {
      segments.push('high_value');
    } else if (lifetimeValue >= 300) {
      segments.push('medium_value');
    } else {
      segments.push('low_value');
    }
    
    // Determine recency-based segments
    const workOrderCount = workOrders?.length || 0;
    const mostRecentWorkOrder = workOrders && workOrders.length > 0 ? workOrders[0] : null;
    
    // New customer segment
    if (workOrderCount <= 1 && 
        mostRecentWorkOrder && 
        new Date(mostRecentWorkOrder.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      segments.push('new');
    }
    
    // At-risk segment
    const daysSinceLastService = mostRecentWorkOrder 
      ? (Date.now() - new Date(mostRecentWorkOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
      
    if (daysSinceLastService > 180 && workOrderCount > 0) {
      segments.push('at_risk');
    }
    
    // Loyal customer segment
    if (workOrderCount >= 3 && daysSinceLastService < 365) {
      segments.push('loyal');
    }
    
    // Inactive customer segment
    if (daysSinceLastService > 365 && workOrderCount > 0) {
      segments.push('inactive');
    }
    
    return segments;
  } catch (error) {
    console.error("Error analyzing customer segments:", error);
    return [];
  }
};

/**
 * Calculate retention risk score for a customer
 * @param customerId The ID of the customer
 * @returns Risk score from 0-100 where higher means higher risk of churning
 */
export const calculateRetentionRiskScore = async (customerId: string): Promise<number> => {
  try {
    // Fetch customer data and history
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("created_at, updated_at")
      .eq("id", customerId)
      .single();
      
    if (customerError) {
      console.error("Error fetching customer for risk calculation:", customerError);
      return 50; // Default to medium risk on error
    }
    
    // Fetch work orders to analyze service history
    const { data: workOrders, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("created_at, status")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
      
    if (workOrdersError) {
      console.error("Error fetching work orders for risk calculation:", workOrdersError);
      // Continue without work orders data
    }
    
    // Initialize risk score factors
    let riskScore = 50; // Start at neutral risk
    
    // Factor 1: Recency of last service
    const mostRecentWorkOrder = workOrders && workOrders.length > 0 ? workOrders[0] : null;
    const daysSinceLastService = mostRecentWorkOrder 
      ? (Date.now() - new Date(mostRecentWorkOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : 365; // Default to a year if no work orders
      
    // Increase risk as time since last service increases
    if (daysSinceLastService > 365) {
      riskScore += 30;
    } else if (daysSinceLastService > 180) {
      riskScore += 20;
    } else if (daysSinceLastService > 90) {
      riskScore += 10;
    } else {
      riskScore -= 10; // Recent service reduces risk
    }
    
    // Factor 2: Frequency of services
    const serviceFrequency = workOrders 
      ? workOrders.length / (Math.max(daysSinceLastService, 30) / 365) 
      : 0;
      
    // More frequent service indicates loyalty and lower risk
    if (serviceFrequency > 2) {
      riskScore -= 15;
    } else if (serviceFrequency > 1) {
      riskScore -= 10;
    } else if (serviceFrequency < 0.5 && workOrders && workOrders.length > 0) {
      riskScore += 10; // Infrequent service indicates higher risk
    }
    
    // Factor 3: Customer engagement based on notes and communications
    const { data: notes, error: notesError } = await supabase
      .from("customer_notes")
      .select("created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
      
    const { data: communications, error: commsError } = await supabase
      .from("customer_communications")
      .select("date")
      .eq("customer_id", customerId)
      .order("date", { ascending: false });
      
    const lastEngagement = [
      ...(notes?.map(n => new Date(n.created_at).getTime()) || []),
      ...(communications?.map(c => new Date(c.date).getTime()) || [])
    ].sort((a, b) => b - a)[0]; // Most recent engagement
    
    if (lastEngagement) {
      const daysSinceEngagement = (Date.now() - lastEngagement) / (1000 * 60 * 60 * 24);
      
      // Recent engagement reduces risk
      if (daysSinceEngagement < 30) {
        riskScore -= 15;
      } else if (daysSinceEngagement > 180) {
        riskScore += 15; // Old engagement increases risk
      }
    } else {
      riskScore += 10; // No engagement history increases risk
    }
    
    // Ensure the final score is within 0-100 range
    return Math.max(0, Math.min(100, riskScore));
  } catch (error) {
    console.error("Error calculating retention risk score:", error);
    return 50; // Default to medium risk on error
  }
};
