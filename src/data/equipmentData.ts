
import { Equipment } from "@/types/equipment";
import { workOrders } from "./workOrdersData";

// Status definitions with styling
export const equipmentStatusMap = {
  "operational": { label: "Operational", classes: "bg-green-100 text-green-800" },
  "maintenance-required": { label: "Maintenance Required", classes: "bg-yellow-100 text-yellow-800" },
  "out-of-service": { label: "Out of Service", classes: "bg-red-100 text-red-800" },
  "decommissioned": { label: "Decommissioned", classes: "bg-slate-100 text-slate-800" },
};

// Warranty status definitions with styling
export const warrantyStatusMap = {
  "active": { label: "Active", classes: "bg-green-100 text-green-800" },
  "expired": { label: "Expired", classes: "bg-red-100 text-red-800" },
  "not-applicable": { label: "N/A", classes: "bg-slate-100 text-slate-800" },
};

// Maintenance frequency labels
export const maintenanceFrequencyMap = {
  "monthly": "Monthly",
  "quarterly": "Quarterly",
  "bi-annually": "Bi-Annually",
  "annually": "Annually",
  "as-needed": "As Needed",
};

// Mock data for equipment/assets
export const equipment: Equipment[] = [
  {
    id: "EQ-2023-001",
    name: "HVAC System",
    model: "SuperCool 5000",
    serialNumber: "SC5K-12345",
    manufacturer: "TechCool Inc.",
    category: "HVAC",
    purchaseDate: "2021-06-15",
    installDate: "2021-06-20",
    customer: "Acme Corporation",
    location: "123 Business Park, Suite 400",
    status: "operational",
    nextMaintenanceDate: "2023-12-15",
    maintenanceFrequency: "quarterly",
    lastMaintenanceDate: "2023-09-15",
    warrantyExpiryDate: "2024-06-15",
    warrantyStatus: "active",
    notes: "3-year extended warranty purchased",
    workOrderHistory: ["WO-2023-0012"]
  },
  {
    id: "EQ-2023-002",
    name: "Electrical Panel",
    model: "PowerMax 200",
    serialNumber: "PM200-67890",
    manufacturer: "ElectriTech",
    category: "Electrical",
    purchaseDate: "2022-02-10",
    installDate: "2022-02-14",
    customer: "Johnson Residence",
    location: "456 Maple Street",
    status: "maintenance-required",
    nextMaintenanceDate: "2023-08-10",
    maintenanceFrequency: "annually",
    lastMaintenanceDate: "2022-08-10",
    warrantyExpiryDate: "2025-02-10",
    warrantyStatus: "active",
    notes: "Maintenance overdue",
    workOrderHistory: ["WO-2023-0011"]
  },
  {
    id: "EQ-2023-003",
    name: "Security Camera System",
    model: "SecureView Pro",
    serialNumber: "SVP-54321",
    manufacturer: "SecuriCorp",
    category: "Security",
    purchaseDate: "2020-11-05",
    installDate: "2020-11-20",
    customer: "City Hospital",
    location: "789 Medical Center Drive",
    status: "operational",
    nextMaintenanceDate: "2023-11-20",
    maintenanceFrequency: "annually",
    lastMaintenanceDate: "2022-11-20",
    warrantyExpiryDate: "2023-11-05",
    warrantyStatus: "active",
    notes: "Warranty expires soon",
    workOrderHistory: ["WO-2023-0010"]
  },
  {
    id: "EQ-2023-004",
    name: "Commercial Refrigerator",
    model: "CoolStore 2000",
    serialNumber: "CS2K-13579",
    manufacturer: "FrigidTech",
    category: "Kitchen Equipment",
    purchaseDate: "2019-04-18",
    installDate: "2019-04-25",
    customer: "Sunset Restaurant",
    location: "777 Culinary Place",
    status: "out-of-service",
    nextMaintenanceDate: "2023-10-18",
    maintenanceFrequency: "quarterly",
    lastMaintenanceDate: "2023-07-18",
    warrantyExpiryDate: "2022-04-18",
    warrantyStatus: "expired",
    notes: "Currently out of service, needs major repair",
    workOrderHistory: ["WO-2023-0007"]
  },
  {
    id: "EQ-2023-005",
    name: "Fire Alarm System",
    model: "FireGuard 360",
    serialNumber: "FG360-24680",
    manufacturer: "SafetyFirst",
    category: "Safety",
    purchaseDate: "2020-08-30",
    installDate: "2020-09-15",
    customer: "Green Valley School",
    location: "555 Education Road",
    status: "operational",
    nextMaintenanceDate: "2024-03-15",
    maintenanceFrequency: "bi-annually",
    lastMaintenanceDate: "2023-09-15",
    warrantyExpiryDate: "2025-08-30",
    warrantyStatus: "active",
    notes: "5-year warranty with annual inspection requirement",
    workOrderHistory: ["WO-2023-0008"]
  }
];

// Function to get equipment by customer
export const getEquipmentByCustomer = (customerName: string): Equipment[] => {
  return equipment.filter(item => item.customer === customerName);
};

// Function to get equipment that needs maintenance soon (within 30 days)
export const getMaintenanceDueEquipment = (): Equipment[] => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  return equipment.filter(item => {
    const maintenanceDate = new Date(item.nextMaintenanceDate);
    return maintenanceDate >= today && maintenanceDate <= thirtyDaysFromNow;
  });
};

// Function to get equipment with expiring warranties (within 60 days)
export const getExpiringWarrantyEquipment = (): Equipment[] => {
  const today = new Date();
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(today.getDate() + 60);
  
  return equipment.filter(item => {
    const expiryDate = new Date(item.warrantyExpiryDate);
    return expiryDate >= today && expiryDate <= sixtyDaysFromNow && item.warrantyStatus === "active";
  });
};

// Function to get work orders for a specific equipment
export const getWorkOrdersForEquipment = (equipmentId: string) => {
  const targetEquipment = equipment.find(item => item.id === equipmentId);
  if (!targetEquipment || !targetEquipment.workOrderHistory) return [];
  
  return workOrders.filter(order => 
    targetEquipment.workOrderHistory?.includes(order.id)
  );
};
