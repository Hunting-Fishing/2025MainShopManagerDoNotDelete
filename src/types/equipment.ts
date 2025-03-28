
// Define types for equipment maintenance
export type MaintenanceFrequency = "monthly" | "quarterly" | "bi-annually" | "annually" | "as-needed";

// Define types for equipment warranty status
export type WarrantyStatus = "active" | "expired" | "not-applicable";

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
}
