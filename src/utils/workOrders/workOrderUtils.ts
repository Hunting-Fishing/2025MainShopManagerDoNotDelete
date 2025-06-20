
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderStatus } from './constants';

/**
 * Consolidated work order utility functions
 */

// Data normalization and formatting
export const normalizeWorkOrder = (dbWorkOrder: any): WorkOrder => {
  if (!dbWorkOrder) {
    throw new Error('Work order data is required');
  }

  return {
    id: dbWorkOrder.id,
    customer_id: dbWorkOrder.customer_id,
    vehicle_id: dbWorkOrder.vehicle_id,
    advisor_id: dbWorkOrder.advisor_id,
    technician_id: dbWorkOrder.technician_id,
    estimated_hours: dbWorkOrder.estimated_hours,
    total_cost: dbWorkOrder.total_cost,
    created_by: dbWorkOrder.created_by,
    created_at: dbWorkOrder.created_at,
    updated_at: dbWorkOrder.updated_at,
    start_time: dbWorkOrder.start_time,
    end_time: dbWorkOrder.end_time,
    service_category_id: dbWorkOrder.service_category_id,
    invoiced_at: dbWorkOrder.invoiced_at,
    status: dbWorkOrder.status || 'pending',
    description: dbWorkOrder.description || '',
    service_type: dbWorkOrder.service_type,
    invoice_id: dbWorkOrder.invoice_id,
    
    // Backward compatibility fields
    customer: dbWorkOrder.customer || '',
    technician: dbWorkOrder.technician || '',
    date: dbWorkOrder.created_at,
    dueDate: dbWorkOrder.end_time,
    due_date: dbWorkOrder.end_time,
    priority: dbWorkOrder.priority || 'medium',
    location: dbWorkOrder.location || '',
    notes: dbWorkOrder.notes || dbWorkOrder.description || '',
    
    // Additional fields
    timeEntries: [],
    inventoryItems: [],
    inventory_items: []
  };
};

export const formatWorkOrderForDb = (workOrder: Partial<WorkOrder>) => {
  return {
    customer_id: workOrder.customer_id,
    vehicle_id: workOrder.vehicle_id,
    advisor_id: workOrder.advisor_id,
    technician_id: workOrder.technician_id,
    estimated_hours: workOrder.estimated_hours,
    total_cost: workOrder.total_cost,
    created_by: workOrder.created_by,
    start_time: workOrder.start_time,
    end_time: workOrder.end_time || workOrder.dueDate,
    service_category_id: workOrder.service_category_id,
    status: workOrder.status || 'pending',
    description: workOrder.description,
    service_type: workOrder.service_type,
    invoice_id: workOrder.invoice_id
  };
};

// Time calculations
export const calculateTotalTime = (timeEntries: any[]) => {
  return timeEntries.reduce((total, entry) => {
    if (entry.end_time && entry.start_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }
    return total;
  }, 0);
};

export const calculateBillableTime = (timeEntries: any[]) => {
  return timeEntries.reduce((total, entry) => {
    if (entry.is_billable && entry.end_time && entry.start_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }
    return total;
  }, 0);
};

// Status and priority helpers
export const convertStatusToTyped = (status: string): WorkOrderStatus => {
  const validStatuses = [
    'pending', 'in-progress', 'completed', 'cancelled', 'on-hold',
    'body-shop', 'mobile-service', 'needs-road-test', 'parts-requested',
    'parts-ordered', 'parts-arrived', 'customer-to-return', 'rebooked',
    'foreman-signoff-waiting', 'foreman-signoff-complete', 'sublet',
    'waiting-customer-auth', 'po-requested', 'tech-support', 'warranty', 'internal-ro'
  ];
  
  if (validStatuses.includes(status)) {
    return status as WorkOrderStatus;
  }
  
  return 'pending' as WorkOrderStatus;
};

// Data display helpers
export const getCustomerName = (workOrder: WorkOrder): string => {
  if (workOrder.customer_name) return workOrder.customer_name;
  if (workOrder.customer) return workOrder.customer;
  if (workOrder.customer_id) return 'Loading customer...';
  return 'Unknown Customer';
};

export const getVehicleInfo = (workOrder: WorkOrder): string => {
  const year = workOrder.vehicle_year;
  const make = workOrder.vehicle_make;
  const model = workOrder.vehicle_model;
  
  if (year && make && model) return `${year} ${make} ${model}`;
  if (make && model) return `${make} ${model}`;
  if (make) return make;
  if (workOrder.vehicle_id) return 'Loading vehicle...';
  return 'No vehicle info';
};

export const getTechnicianName = (workOrder: WorkOrder): string => {
  if (workOrder.technician) return workOrder.technician;
  if (workOrder.technician_id) return 'Loading technician...';
  return 'Unassigned';
};
