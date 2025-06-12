
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

    if (!over || !active) {
      console.log('No valid drop target or active item');
      return;
    }

    const partId = active.id as string;
    const sourceJobLineId = active.data.current?.jobLineId;
    const targetData = over.data.current;

    console.log('Drag end event:', { partId, sourceJobLineId, targetData, overId: over.id });

    // Only handle drops on job lines
    if (targetData?.type !== 'jobLine') {
      console.log('Not dropping on a job line, ignoring');
      return;
    }

    const targetJobLineId = targetData.jobLineId;

    // Don't do anything if dropping on the same job line
    if (sourceJobLineId === targetJobLineId) {
      console.log('Dropping on same job line, no change needed');
      return;
    }

    console.log(`Moving part ${partId} from job line ${sourceJobLineId} to ${targetJobLineId}`);

    // Optimistically update local state first for immediate UI feedback
    const updatedParts = parts.map(part => 
      part.id === partId 
        ? { ...part, job_line_id: targetJobLineId }
        : part
    );
    
    console.log('Optimistically updating local state');
    onPartsChange(updatedParts);

    try {
      // Update in database
      const { error } = await supabase
        .from('work_order_parts')
        .update({ 
          job_line_id: targetJobLineId,
          updated_at: new Date().toISOString()
        })
        .eq('id', partId);

      if (error) {
        console.error('Database update error:', error);
        // Revert the optimistic update
        onPartsChange(parts);
        throw error;
      }

      console.log('Database update successful');
      toast.success('Part moved successfully');
    } catch (error) {
      console.error('Error moving part:', error);
      toast.error('Failed to move part. Please try again.');
    }
  };

  return { handleDragEnd };
}
