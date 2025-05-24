
// Define types for equipment maintenance
export type MaintenanceFrequency = "monthly" | "quarterly" | "bi-annually" | "annually" | "as-needed";

// Define types for equipment warranty status
export type WarrantyStatus = "active" | "expired" | "not-applicable";

// Define equipment status type to match database
export type EquipmentStatus = "operational" | "maintenance-required" | "out-of-service" | "decommissioned";

// Define maintenance history record interface
export interface MaintenanceRecord {
  id: string;
  date: string;
  technician: string;
  description: string;
  cost?: number;
  notes?: string;
  workOrderId?: string;
}

// Define a maintenance schedule interface
export interface MaintenanceSchedule {
  id: string;
  frequencyType: MaintenanceFrequency;
  nextDate: string;
  description: string;
  estimatedDuration: number; // in hours
  technician?: string;
  isRecurring: boolean;
  notificationsEnabled: boolean;
  reminderDays: number; // days before to send notification
}

// Define equipment/asset interface that matches the database structure
export interface Equipment {
  id: string;
  name: string;
  model: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  category: string;
  purchase_date: string | null;
  install_date: string | null;
  customer: string;
  location: string | null;
  status: EquipmentStatus;
  next_maintenance_date: string | null;
  maintenance_frequency: string;
  last_maintenance_date: string | null;
  warranty_expiry_date: string | null;
  warranty_status: string | null;
  notes?: string;
  shop_id?: string | null;
  created_at: string;
  updated_at: string;
  work_order_history?: any[];
  maintenance_history?: MaintenanceRecord[];
  maintenance_schedules?: MaintenanceSchedule[];
}
