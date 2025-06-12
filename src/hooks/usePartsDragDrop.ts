
import { DragEndEvent } from '@dnd-kit/core';
import { WorkOrderPart } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePartsDragDrop(
  parts: WorkOrderPart[],
  onPartsChange: (parts: WorkOrderPart[]) => void
) {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active) return;

    const partId = active.id as string;
    const sourceJobLineId = active.data.current?.jobLineId;
    const targetData = over.data.current;

    // Only handle drops on job lines
    if (targetData?.type !== 'jobLine') return;

    const targetJobLineId = targetData.jobLineId;

    // Don't do anything if dropping on the same job line
    if (sourceJobLineId === targetJobLineId) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('work_order_parts')
        .update({ job_line_id: targetJobLineId })
        .eq('id', partId);

      if (error) throw error;

      // Update local state
      const updatedParts = parts.map(part => 
        part.id === partId 
          ? { ...part, job_line_id: targetJobLineId }
          : part
      );
      
      onPartsChange(updatedParts);
      toast.success('Part moved successfully');
    } catch (error) {
      console.error('Error moving part:', error);
      toast.error('Failed to move part');
    }
  };

  return { handleDragEnd };
}
