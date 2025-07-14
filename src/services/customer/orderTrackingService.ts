import { supabase } from "@/integrations/supabase/client";

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  location?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  carrier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingUpdate {
  status: string;
  location?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  carrier?: string;
  notes?: string;
}

export const orderTrackingService = {
  // Get tracking information for an order
  async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    const { data, error } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add tracking update
  async addTrackingUpdate(orderId: string, update: OrderTrackingUpdate): Promise<OrderTracking> {
    const { data, error } = await supabase
      .from('order_tracking')
      .insert({
        order_id: orderId,
        ...update
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update tracking information
  async updateTracking(trackingId: string, update: Partial<OrderTrackingUpdate>): Promise<OrderTracking> {
    const { data, error } = await supabase
      .from('order_tracking')
      .update(update)
      .eq('id', trackingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to tracking updates
  subscribeToTrackingUpdates(orderId: string, callback: (tracking: OrderTracking) => void) {
    return supabase
      .channel(`order_tracking_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as OrderTracking);
          }
        }
      )
      .subscribe();
  }
};