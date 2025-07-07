
import { WorkOrderRepository } from './WorkOrderRepository';
import { WorkOrder, WorkOrderFormValues } from '@/types/workOrder';

export class WorkOrderService {
  private repository: WorkOrderRepository;

  constructor() {
    this.repository = new WorkOrderRepository();
  }

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      console.error('WorkOrderService: Error fetching work orders:', error);
      throw error;
    }
  }

  async getWorkOrderById(id: string): Promise<WorkOrder> {
    try {
      const workOrder = await this.repository.findById(id);
      if (!workOrder) {
        throw new Error(`Work order with ID ${id} not found`);
      }
      return workOrder;
    } catch (error) {
      console.error('WorkOrderService: Error fetching work order by ID:', error);
      throw error;
    }
  }

  async createWorkOrder(formData: WorkOrderFormValues): Promise<WorkOrder> {
    try {
      console.log('=== WORK ORDER SERVICE DEBUG ===');
      console.log('1. Service received form data:', formData);
      
      const workOrderData = this.mapFormToWorkOrder(formData);
      console.log('2. Mapped data for database:', workOrderData);
      
      const result = await this.repository.create(workOrderData);
      console.log('3. Repository returned:', result);
      
      return result;
    } catch (error) {
      console.error('WorkOrderService: Error creating work order:', error);
      console.error('Form data that caused error:', formData);
      throw error;
    }
  }

  async updateWorkOrder(id: string, formData: Partial<WorkOrderFormValues>): Promise<WorkOrder> {
    try {
      const updateData = this.mapFormToWorkOrder(formData);
      return await this.repository.update(id, updateData);
    } catch (error) {
      console.error('WorkOrderService: Error updating work order:', error);
      throw error;
    }
  }

  async updateWorkOrderStatus(id: string, status: string, userId?: string, userName?: string): Promise<WorkOrder> {
    try {
      return await this.repository.updateStatus(id, status, userId, userName);
    } catch (error) {
      console.error('WorkOrderService: Error updating work order status:', error);
      throw error;
    }
  }

  async deleteWorkOrder(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      console.error('WorkOrderService: Error deleting work order:', error);
      throw error;
    }
  }

  async getWorkOrdersByCustomer(customerId: string): Promise<WorkOrder[]> {
    try {
      return await this.repository.findByCustomerId(customerId);
    } catch (error) {
      console.error('WorkOrderService: Error fetching work orders by customer:', error);
      throw error;
    }
  }

  /**
   * Maps form priority values to database urgency_level values
   */
  private static mapPriorityToUrgencyLevel(priority: string): string {
    const priorityMap: Record<string, string> = {
      'low': 'Low',
      'medium': 'Normal',
      'high': 'Urgent',
      'critical': 'Emergency'
    };
    
    return priorityMap[priority?.toLowerCase()] || 'Normal';
  }

  private mapFormToWorkOrder(formData: Partial<WorkOrderFormValues>): any {
    console.log('=== MAPPING FORM TO DATABASE ===');
    console.log('Input form data:', formData);
    
    const mapped = {
      // Core work order fields that exist in database
      customer_id: (formData as any).customerId || null,
      vehicle_id: (formData as any).vehicleId || null,
      description: formData.description,
      status: formData.status || 'pending',
      technician_id: (formData as any).technicianId || null,
      service_type: (formData as any).serviceType || null,
      estimated_hours: (formData as any).estimatedHours || null,
      
      // Map form fields to actual database columns
      urgency_level: WorkOrderService.mapPriorityToUrgencyLevel(formData.priority || 'medium'),
      customer_complaint: formData.description || null,
      complaint_source: (formData as any).complaintSource || 'Customer',
      additional_info: (formData as any).additionalInfo || null,
      customer_instructions: (formData as any).customerInstructions || formData.notes || null,
      authorization_limit: (formData as any).authorizationLimit || 0,
      preferred_contact_method: (formData as any).preferredContactMethod || 'Phone',
      drop_off_type: (formData as any).dropOffType || 'Walk-in',
      diagnostic_notes: (formData as any).diagnosticNotes || null,
      initial_mileage: (formData as any).initialMileage || null,
      vehicle_condition_notes: (formData as any).vehicleConditionNotes || null,
      customer_waiting: (formData as any).customerWaiting || false,
      is_warranty: (formData as any).isWarranty || false,
      is_repeat_issue: (formData as any).isRepeatIssue || false,
      vehicle_damages: (formData as any).vehicleDamages || [],
      service_tags: (formData as any).serviceTags || [],
      
      // Set timestamps (created_at and updated_at have defaults in DB)
      write_up_time: new Date().toISOString(),
    };
    
    // Only include non-null values to avoid database errors
    const cleanedMapped = Object.fromEntries(
      Object.entries(mapped).filter(([_, value]) => value !== null && value !== undefined)
    );
    
    console.log('Mapped database data:', cleanedMapped);
    return cleanedMapped;
  }
}
