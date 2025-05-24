
import { Equipment } from "@/types/equipment";

// Mock equipment data for testing
export const mockEquipmentData: Equipment[] = [
  {
    id: "EQ-001",
    name: "Hydraulic Lift #1",
    model: "HL-2000",
    serial_number: "HL2000-001",
    manufacturer: "LiftCorp",
    category: "Lifts",
    purchase_date: "2020-01-15",
    install_date: "2020-02-01",
    customer: "AutoShop Pro",
    location: "Bay 1",
    status: "operational",
    next_maintenance_date: "2024-03-15",
    maintenance_frequency: "quarterly",
    last_maintenance_date: "2023-12-15",
    warranty_expiry_date: "2025-01-15",
    warranty_status: "active",
    notes: "Primary lift for heavy vehicles",
    shop_id: "shop-1",
    created_at: "2020-01-15T00:00:00Z",
    updated_at: "2023-12-15T00:00:00Z",
    work_order_history: [],
    maintenance_history: [],
    maintenance_schedules: []
  }
];

// Helper functions for filtering equipment based on status
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

// Maintenance frequency display mapping
export const maintenanceFrequencyMap: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly", 
  "bi-annually": "Bi-Annually",
  annually: "Annually",
  "as-needed": "As Needed"
};

// Get maintenance due equipment (within specified days)
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
