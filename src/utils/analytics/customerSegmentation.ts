import { supabase } from "@/lib/supabase";
import { calculateCustomerLifetimeValue } from "./customerLifetimeValue";

export type CustomerSegmentType = 'high_value' | 'medium_value' | 'low_value' | 'new' | 'at_risk' | 'loyal' | 'inactive';

/**
 * Calculate the retention risk score for a customer (0-100)
 * Higher score = higher risk of losing the customer
 */
export const calculateRetentionRiskScore = async (customerId: string): Promise<number> => {
  try {
    // Get customer info and activity
    const [customerInfo, workOrders, communications] = await Promise.all([
      supabase.from('customers').select('created_at').eq('id', customerId).single(),
      supabase.from('work_orders').select('created_at, status').eq('customer_id', customerId).order('created_at', { ascending: false }),
      supabase.from('customer_communications').select('date, type').eq('customer_id', customerId).order('date', { ascending: false })
    ]);
    
    if (customerInfo.error || !customerInfo.data) {
      console.error("Error fetching customer info for risk score:", customerInfo.error);
      return 50; // Default to medium risk if error
    }
    
    let riskScore = 50; // Start at neutral risk
    
    // Factor 1: Last interaction time
    const lastWorkOrder = workOrders.data && workOrders.data.length > 0 ? new Date(workOrders.data[0].created_at) : null;
    const lastCommunication = communications.data && communications.data.length > 0 ? new Date(communications.data[0].date) : null;
    
    let lastInteractionDate = null;
    if (lastWorkOrder && lastCommunication) {
      lastInteractionDate = lastWorkOrder > lastCommunication ? lastWorkOrder : lastCommunication;
    } else {
      lastInteractionDate = lastWorkOrder || lastCommunication;
    }
    
    if (lastInteractionDate) {
      const daysSinceLastInteraction = Math.floor((new Date().getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Adjust risk based on recency
      if (daysSinceLastInteraction > 365) {
        riskScore += 30; // Very high risk if no interaction in a year
      } else if (daysSinceLastInteraction > 180) {
        riskScore += 20; // High risk if no interaction in 6 months
      } else if (daysSinceLastInteraction > 90) {
        riskScore += 10; // Moderate risk if no interaction in 3 months
      } else if (daysSinceLastInteraction < 30) {
        riskScore -= 15; // Low risk if recent interaction
      }
    } else {
      riskScore += 25; // High risk if no interactions at all
    }
    
    // Factor 2: Work order history
    if (workOrders.data) {
      // More work orders generally means lower risk
      if (workOrders.data.length > 5) {
        riskScore -= 15;
      } else if (workOrders.data.length > 2) {
        riskScore -= 10;
      }
      
      // Check if they have any negative experiences (canceled or disputed work orders)
      const negativeExperiences = workOrders.data.filter(wo => 
        wo.status === 'cancelled' || wo.status === 'disputed'
      ).length;
      
      if (negativeExperiences > 1) {
        riskScore += 25; // Multiple negative experiences is a big risk
      } else if (negativeExperiences === 1) {
        riskScore += 15; // One negative experience increases risk
      }
    }
    
    // Factor 3: Communication frequency
    if (communications.data && communications.data.length > 0) {
      // More communications generally means lower risk
      if (communications.data.length > 10) {
        riskScore -= 10;
      } else if (communications.data.length > 5) {
        riskScore -= 5;
      }
    }
    
    // Ensure risk score is between 0-100
    return Math.min(Math.max(Math.round(riskScore), 0), 100);
  } catch (error) {
    console.error("Error calculating retention risk score:", error);
    return 50; // Default to medium risk
  }
};

/**
 * Analyze customer data to determine which segments they belong to
 */
export const analyzeCustomerSegments = async (customerId: string): Promise<CustomerSegmentType[]> => {
  try {
    // Get customer's lifetime value
    const clv = await calculateCustomerLifetimeValue(customerId);
    
    // Get customer info including creation date
    const { data: customerData, error } = await supabase
      .from('customers')
      .select('created_at')
      .eq('id', customerId)
      .single();
      
    if (error || !customerData) {
      console.error("Error fetching customer data for segmentation:", error);
      return ["unknown"] as unknown as CustomerSegmentType[];
    }
    
    // Get work order history
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    const segments: CustomerSegmentType[] = [];
    
    // Segment by customer value
    if (clv > 2000) {
      segments.push("high_value");
    } else if (clv > 500) {
      segments.push("medium_value");
    } else {
      segments.push("low_value");
    }
    
    // Segment by loyalty/tenure
    const createdAt = new Date(customerData.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreation < 60) {
      segments.push("new");
    } else {
      // Check if they have consistent service history
      if (workOrders && workOrders.length >= 3) {
        segments.push("loyal");
      }
    }
    
    // Segment by activity
    if (workOrders && workOrders.length > 0) {
      const lastWorkOrderDate = new Date(workOrders[0].created_at);
      const daysSinceLastWorkOrder = Math.floor((now.getTime() - lastWorkOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastWorkOrder > 365) {
        segments.push("inactive");
      } else if (daysSinceLastWorkOrder > 180) {
        segments.push("at_risk");
      }
    }
    
    return segments;
  } catch (error) {
    console.error("Error analyzing customer segments:", error);
    return ["unknown"] as unknown as CustomerSegmentType[];
  }
};
