
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

    console.log('Drag end event:', { partId, sourceJobLineId, targetData });

    // Only handle drops on job lines
    if (targetData?.type !== 'jobLine') return;

    const targetJobLineId = targetData.jobLineId;

    // Don't do anything if dropping on the same job line
    if (sourceJobLineId === targetJobLineId) return;

    try {
      console.log(`Moving part ${partId} from job line ${sourceJobLineId} to ${targetJobLineId}`);
      
      // Update in database first
      const { error } = await supabase
        .from('work_order_parts')
        .update({ job_line_id: targetJobLineId })
        .eq('id', partId);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state only after successful database update
      const updatedParts = parts.map(part => 
        part.id === partId 
          ? { ...part, job_line_id: targetJobLineId }
          : part
      );
      
      console.log('Updating local state with:', updatedParts);
      onPartsChange(updatedParts);
      toast.success('Part moved successfully');
    } catch (error) {
      console.error('Error moving part:', error);
      toast.error('Failed to move part. Please try again.');
    }
  };

  return { handleDragEnd };
}
