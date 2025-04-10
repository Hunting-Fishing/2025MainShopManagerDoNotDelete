
import { supabase } from "@/lib/supabase";
import { fetchWorkOrders } from "./workOrdersData";
import { MaintenanceFrequency, MaintenanceRecord, MaintenanceSchedule } from "@/types/equipment";

// Equipment status mapping
export const equipmentStatusMap = {
  "operational": {
    label: "Operational",
    classes: "bg-green-100 text-green-800"
  },
  "maintenance-required": {
    label: "Maintenance Required",
    classes: "bg-amber-100 text-amber-800"
  },
  "out-of-service": {
    label: "Out of Service",
    classes: "bg-red-100 text-red-800"
  },
  "decommissioned": {
    label: "Decommissioned",
    classes: "bg-slate-100 text-slate-800"
  }
};

// Warranty status mapping
export const warrantyStatusMap = {
  "active": {
    label: "Active",
    classes: "bg-green-100 text-green-800"
  },
  "expired": {
    label: "Expired",
    classes: "bg-red-100 text-red-800"
  },
  "not-applicable": {
    label: "N/A",
    classes: "bg-slate-100 text-slate-800"
  }
};

// Maintenance frequency mapping
export const maintenanceFrequencyMap = {
  "monthly": "Monthly",
  "quarterly": "Quarterly",
  "bi-annually": "Bi-Annually",
  "annually": "Annually",
  "as-needed": "As Needed"
};

// Fetch equipment data from Supabase
export const fetchEquipment = async () => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name');
      
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      customer: item.customer,
      serialNumber: item.serial_number,
      model: item.model,
      manufacturer: item.manufacturer,
      category: item.category,
      status: item.status,
      purchaseDate: item.purchase_date,
      lastMaintenanceDate: item.last_maintenance_date,
      nextMaintenanceDate: item.next_maintenance_date,
      maintenanceFrequency: item.maintenance_frequency,
      location: item.location,
      notes: item.notes,
      installDate: item.install_date,
      warrantyExpiryDate: item.warranty_expiry_date,
      warrantyStatus: item.warranty_status,
      workOrderHistory: item.work_order_history || [],
      maintenanceHistory: item.maintenance_history || [],
      maintenanceSchedules: item.maintenance_schedules || []
    }));
  } catch (err) {
    console.error("Error fetching equipment:", err);
    return [];
  }
};

// Fetch equipment categories
export const fetchEquipmentCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('category');
      
    if (error) {
      throw error;
    }
    
    // Extract unique categories
    const categories = data.map(item => item.category);
    return [...new Set(categories)].sort();
  } catch (err) {
    console.error("Error fetching equipment categories:", err);
    return [];
  }
};

// Get equipment requiring maintenance
export const getOverdueMaintenanceEquipment = async () => {
  try {
    const equipment = await fetchEquipment();
    const today = new Date();
    
    return equipment.filter(item => {
      if (!item.nextMaintenanceDate) return false;
      return new Date(item.nextMaintenanceDate) < today;
    });
  } catch (err) {
    console.error("Error getting overdue maintenance equipment:", err);
    return [];
  }
};

// Get equipment with maintenance due soon (next 30 days)
export const getMaintenanceDueEquipment = async () => {
  try {
    const equipment = await fetchEquipment();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return equipment.filter(item => {
      if (!item.nextMaintenanceDate) return false;
      const nextDate = new Date(item.nextMaintenanceDate);
      return nextDate >= today && nextDate <= thirtyDaysFromNow;
    });
  } catch (err) {
    console.error("Error getting maintenance due equipment:", err);
    return [];
  }
};
