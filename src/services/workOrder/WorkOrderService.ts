
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
      const workOrderData = this.mapFormToWorkOrder(formData);
      return await this.repository.create(workOrderData);
    } catch (error) {
      console.error('WorkOrderService: Error creating work order:', error);
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
    return {
      // Map form fields to database fields
      customer_id: (formData as any).customerId,
      vehicle_id: (formData as any).vehicleId,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      technician: formData.technician,
      technician_id: (formData as any).technicianId,
      location: formData.location,
      due_date: formData.dueDate,
      notes: formData.notes,
      service_type: (formData as any).serviceType,
      estimated_hours: (formData as any).estimatedHours,
      
      // Vehicle information (if creating inline)
      vehicle_make: formData.vehicleMake,
      vehicle_model: formData.vehicleModel,
      vehicle_year: formData.vehicleYear,
      vehicle_license_plate: formData.licensePlate,
      vehicle_vin: formData.vin,
      vehicle_odometer: formData.odometer,
      
      // Customer information (if creating inline)
      customer_name: formData.customer,
      customer_email: (formData as any).customerEmail,
      customer_phone: (formData as any).customerPhone,
      customer_address: (formData as any).customerAddress,
    };
  }
}
