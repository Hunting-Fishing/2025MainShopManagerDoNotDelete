
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { updateWorkOrderJobLine } from './jobLinesService';
import { updateWorkOrderPart } from './workOrderPartsService';

export class EditService {
  static async updateJobLine(
    jobLineId: string, 
    updates: Partial<WorkOrderJobLine>
  ): Promise<WorkOrderJobLine> {
    try {
      // Automatically calculate total amount if hours or rate changed
      if (updates.estimated_hours !== undefined || updates.labor_rate !== undefined) {
        const estimatedHours = updates.estimated_hours ?? 0;
        const laborRate = updates.labor_rate ?? 0;
        updates.total_amount = estimatedHours * laborRate;
      }

      return await updateWorkOrderJobLine(jobLineId, updates);
    } catch (error) {
      console.error('Error updating job line:', error);
      throw new Error('Failed to update job line');
    }
  }

  static async updatePart(
    partId: string, 
    updates: Partial<WorkOrderPart>
  ): Promise<WorkOrderPart> {
    try {
      // Automatically calculate total price if quantity or unit price changed
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const quantity = updates.quantity ?? 1;
        const unitPrice = updates.unit_price ?? 0;
        updates.total_price = quantity * unitPrice;
      }

      return await updateWorkOrderPart(partId, updates);
    } catch (error) {
      console.error('Error updating part:', error);
      throw new Error('Failed to update part');
    }
  }
}
