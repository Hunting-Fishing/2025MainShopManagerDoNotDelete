import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useWorkOrderInventoryEffects(workOrderId: string, items: any[]) {
  const updateWorkOrderInventory = async (workOrderId: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ inventory_items: items })
        .eq('id', workOrderId)

      if (error) {
        console.error("Error updating work order inventory:", error);
      }
    } catch (error) {
      console.error("Error updating work order inventory:", error);
    }
  };

  useEffect(() => {
    const updateInventory = async () => {
      await updateWorkOrderInventory(workOrderId, {});
    };
    
    updateInventory();
  }, [workOrderId, items]);
}
