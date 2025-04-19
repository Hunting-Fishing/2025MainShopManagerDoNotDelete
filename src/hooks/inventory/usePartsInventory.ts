
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';

export const usePartsInventory = (workOrderId: string) => {
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async (itemId: string, quantity: number) => {
    const { data, error } = await supabase.rpc('check_inventory_availability', {
      item_id: itemId,
      requested_quantity: quantity
    });

    if (error) {
      console.error('Error checking inventory:', error);
      return false;
    }

    return data;
  }, []);

  const adjustInventory = useCallback(async (
    itemId: string,
    quantity: number,
    adjustmentType: 'reserve' | 'consume' | 'return',
    notes?: string
  ) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory_adjustments')
        .insert({
          work_order_id: workOrderId,
          inventory_item_id: itemId,
          quantity,
          adjustment_type: adjustmentType,
          notes
        });

      if (error) throw error;

      toast({
        title: "Inventory Updated",
        description: `Successfully ${adjustmentType}d ${quantity} items`,
      });

      return true;
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);

  return {
    loading,
    checkAvailability,
    adjustInventory
  };
};
