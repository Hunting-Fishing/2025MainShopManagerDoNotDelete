
// Define types for equipment maintenance
export type MaintenanceFrequency = "monthly" | "quarterly" | "bi-annually" | "annually" | "as-needed";

// Define types for equipment warranty status
export type WarrantyStatus = "active" | "expired" | "not-applicable";

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
  frequencyType: MaintenanceFrequency;
  nextDate: string;
  description: string;
  estimatedDuration: number; // in hours
  technician?: string;
  isRecurring: boolean;
  notificationsEnabled: boolean;
  reminderDays: number; // days before to send notification
}

// Define equipment/asset interface
export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  category: string;
  purchaseDate: string;
  installDate: string;
  customer: string;
  location: string;
  status: "operational" | "maintenance-required" | "out-of-service" | "decommissioned";
  nextMaintenanceDate: string;
  maintenanceFrequency: MaintenanceFrequency;
  lastMaintenanceDate: string;
  warrantyExpiryDate: string;
  warrantyStatus: WarrantyStatus;
  notes?: string;
  workOrderHistory?: string[]; // IDs of related work orders
  maintenanceHistory?: MaintenanceRecord[];
  maintenanceSchedules?: MaintenanceSchedule[];
}
