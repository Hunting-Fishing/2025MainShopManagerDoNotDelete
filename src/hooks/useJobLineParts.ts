
import { useState, useEffect } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';

export function useJobLineParts(workOrderId: string) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updatePartJobLine = async (partId: string, newJobLineId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_parts')
        .update({ job_line_id: newJobLineId })
        .eq('id', partId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating part job line:', error);
      throw error;
    }
  };

  return {
    parts,
    setParts,
    isLoading,
    updatePartJobLine
  };
}
