
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useManualReorder = () => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderItem = async (itemId: string, quantity: number) => {
    try {
      setIsReordering(true);
      
      // Get the item details
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single();
      
      if (itemError) {
        throw itemError;
      }
      
      if (!item) {
        toast({
          title: "Error",
          description: "Item not found",
        });
        return false;
      }
      
      // Create a new order
      const { data, error } = await supabase
        .from('inventory_orders')
        .insert({
          item_id: itemId,
          supplier: item.supplier,
          quantity_ordered: quantity,
          expected_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          status: 'ordered'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Order Placed",
        description: `Ordered ${quantity} units of ${item.name}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error placing manual order:", error);
      toast({
        title: "Error",
        description: "Failed to place order",
      });
      return false;
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderItem,
    isReordering
  };
};
