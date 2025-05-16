
// Work order form schema values interface
export interface WorkOrderFormSchemaValues {
  title?: string;
  description?: string;
  customer?: string;
  customer_id?: string;
  due_date?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  technician?: string;
  technician_id?: string;
  serviceCategory?: string;
  service_type?: string;
  estimated_hours?: number;
  location?: string;
  vehicle_id?: string;
  vehicle?: string;
  notes?: string;
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
}

export default WorkOrderFormSchemaValues;
