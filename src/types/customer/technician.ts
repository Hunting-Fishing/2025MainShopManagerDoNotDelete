
// Technician-related types for customer system
export interface PreferredTechnicianChange {
  id: string;
  customer_id: string;
  previous_technician_id?: string;
  previous_technician_name?: string;
  new_technician_id?: string;
  new_technician_name?: string;
  change_date: string;
  change_reason?: string;
  changed_by_id: string;
  changed_by_name: string;
}
