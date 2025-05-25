
import { Equipment } from "@/types/equipment";

// Equipment status mapping with styles
export const equipmentStatusMap = {
  operational: {
    label: "Operational",
    classes: "bg-green-100 text-green-800 border-green-300"
  },
  "maintenance-required": {
    label: "Maintenance Required", 
    classes: "bg-yellow-100 text-yellow-800 border-yellow-300"
  },
  "out-of-service": {
    label: "Out of Service",
    classes: "bg-red-100 text-red-800 border-red-300"
  },
  decommissioned: {
    label: "Decommissioned",
    classes: "bg-gray-100 text-gray-800 border-gray-300"
  }
};

// Maintenance frequency display mapping
export const maintenanceFrequencyMap: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly", 
  "bi-annually": "Bi-Annually",
  annually: "Annually",
  "as-needed": "As Needed"
};

// Mock equipment data for testing and development
export const mockEquipmentData: Equipment[] = [
  {
    id: "1",
    name: "Hydraulic Lift #1",
    model: "HydroMax 3000",
    serial_number: "HM3000-001",
    manufacturer: "LiftTech",
    category: "Lifting Equipment",
    purchase_date: "2022-01-15",
    install_date: "2022-02-01",
    customer: "AutoShop Pro",
    location: "Bay 1",
    status: "operational",
    next_maintenance_date: "2024-06-15",
    maintenance_frequency: "quarterly",
    last_maintenance_date: "2024-03-15",
    warranty_expiry_date: "2025-01-15",
    warranty_status: "active",
    notes: "Regular maintenance schedule",
    created_at: "2022-01-15T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
    work_order_history: [],
    maintenance_history: [],
    maintenance_schedules: []
  }
];

// Get equipment with maintenance due within specified days
export const getMaintenanceDueEquipment = (equipment: Equipment[], daysThreshold: number = 30): Equipment[] => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);

  return equipment.filter(item => {
    if (!item.next_maintenance_date) {
      return false;
    }
    
    const maintenanceDate = new Date(item.next_maintenance_date);
    return maintenanceDate <= thresholdDate;
  });
};

// Get equipment with warranties expiring within specified days
export const getWarrantyExpiringEquipment = (equipment: Equipment[], daysThreshold: number = 60): Equipment[] => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);

  return equipment.filter(item => {
    if (item.warranty_status !== "active" || !item.warranty_expiry_date) {
      return false;
    }
    
    const expiryDate = new Date(item.warranty_expiry_date);
    return expiryDate <= thresholdDate && expiryDate >= today;
  });
};
