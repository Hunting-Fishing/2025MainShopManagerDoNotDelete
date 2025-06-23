
import { WorkOrderPart } from '@/types/workOrderPart';

export interface PartsAssignmentData {
  partId: string;
  jobLineId: string;
  quantity: number;
  assignedBy: string;
  assignmentDate: string;
  notes?: string;
}

export class PartsAssignmentService {
  static async assignPartToJobLine(data: PartsAssignmentData): Promise<boolean> {
    try {
      console.log('Assigning part to job line:', data);
      
      // Mock assignment logic
      const assignmentRecord = {
        id: crypto.randomUUID(),
        name: 'Auto-assigned Part',
        part_number: `PART-${Date.now()}`,
        description: 'Part assigned via service',
        quantity: data.quantity,
        unit_price: 0,
        total_price: 0,
        status: 'assigned',
        part_type: 'inventory',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        work_order_id: 'mock-work-order',
        job_line_id: data.jobLineId,
        assigned_by: data.assignedBy,
        assignment_date: data.assignmentDate,
        notes: data.notes
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to assign part to job line:', error);
      return false;
    }
  }

  static async unassignPartFromJobLine(partId: string, jobLineId: string): Promise<boolean> {
    try {
      console.log('Unassigning part from job line:', { partId, jobLineId });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to unassign part from job line:', error);
      return false;
    }
  }

  static async getPartsForJobLine(jobLineId: string): Promise<WorkOrderPart[]> {
    try {
      console.log('Getting parts for job line:', jobLineId);
      
      // Mock parts data
      const mockParts: WorkOrderPart[] = [
        {
          id: '1',
          work_order_id: 'mock-work-order',
          job_line_id: jobLineId,
          part_number: 'BRAKE-001',
          name: 'Brake Pads',
          description: 'Front brake pads',
          quantity: 2,
          unit_price: 45.99,
          total_price: 91.98,
          status: 'assigned',
          part_type: 'inventory',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockParts;
    } catch (error) {
      console.error('Failed to get parts for job line:', error);
      return [];
    }
  }
}
