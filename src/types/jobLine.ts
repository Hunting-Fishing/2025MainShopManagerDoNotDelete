
export interface WorkOrderJobLine {
  id: string;
  work_order_id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: 'standard' | 'overtime' | 'premium' | 'flat_rate';
  total_amount?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  display_order?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  parts?: any[]; // For associated parts
}

export interface JobLineFormValues {
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: 'standard' | 'overtime' | 'premium' | 'flat_rate';
  total_amount?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  display_order?: number;
  notes?: string;
}

// Job Line Status mapping for UI display
export const jobLineStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-red-100 text-red-800' }
};
