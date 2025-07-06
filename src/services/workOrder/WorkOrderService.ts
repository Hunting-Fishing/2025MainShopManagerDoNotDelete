
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

  private mapFormToWorkOrder(formData: Partial<WorkOrderFormValues>): any {
    console.log('=== MAPPING FORM TO DATABASE ===');
    console.log('Input form data:', formData);
    
    const mapped = {
      // Map form fields to database fields
      customer_id: (formData as any).customerId || null,
      vehicle_id: (formData as any).vehicleId || null,
      description: formData.description,
      status: formData.status || 'pending',
      priority: formData.priority || 'medium',
      technician: formData.technician || null,
      technician_id: (formData as any).technicianId || null,
      location: formData.location || null,
      due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      notes: formData.notes || null,
      service_type: (formData as any).serviceType || null,
      estimated_hours: (formData as any).estimatedHours || null,
      
      // Vehicle information (if creating inline)
      vehicle_make: formData.vehicleMake || null,
      vehicle_model: formData.vehicleModel || null,
      vehicle_year: formData.vehicleYear || null,
      vehicle_license_plate: formData.licensePlate || null,
      vehicle_vin: formData.vin || null,
      vehicle_odometer: formData.odometer || null,
      
      // Customer information (if creating inline)
      customer_name: formData.customer || null,
      customer_email: (formData as any).customerEmail || null,
      customer_phone: (formData as any).customerPhone || null,
      customer_address: (formData as any).customerAddress || null,
      
      // Ensure created_at and updated_at are set
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('Mapped database data:', mapped);
    return mapped;
  }
}
