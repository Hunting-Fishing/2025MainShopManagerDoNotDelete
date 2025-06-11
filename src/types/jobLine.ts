
export interface WorkOrderJobLine {
  id: string;
  work_order_id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: string;
  total_amount?: number;
  status?: string;
  notes?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface JobLineFormValues {
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: string;
  status?: string;
  notes?: string;
}
