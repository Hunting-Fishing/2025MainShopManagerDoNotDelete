
import { supabase } from "@/lib/supabase";
import { MaintenanceFrequency, MaintenanceRecord, MaintenanceSchedule, Equipment } from "@/types/equipment";

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

// Helper function to validate equipment status
const validateStatus = (status: string): Equipment['status'] => {
  const validStatuses: Equipment['status'][] = [
    "operational", "maintenance-required", "out-of-service", "decommissioned"
  ];
  
  if (validStatuses.includes(status as Equipment['status'])) {
    return status as Equipment['status'];
  }
  
  // Default to operational if invalid
  console.warn(`Invalid equipment status: ${status}, defaulting to "operational"`);
  return "operational";
};

// Helper function to validate warranty status
const validateWarrantyStatus = (status: string): Equipment['warrantyStatus'] => {
  const validStatuses: Equipment['warrantyStatus'][] = [
    "active", "expired", "not-applicable"
  ];
  
  if (validStatuses.includes(status as Equipment['warrantyStatus'])) {
    return status as Equipment['warrantyStatus'];
  }
  
  // Default to not-applicable if invalid
  console.warn(`Invalid warranty status: ${status}, defaulting to "not-applicable"`);
  return "not-applicable";
};

// Helper function to validate maintenance frequency
const validateMaintenanceFrequency = (freq: string): Equipment['maintenanceFrequency'] => {
  const validFrequencies: Equipment['maintenanceFrequency'][] = [
    "monthly", "quarterly", "bi-annually", "annually", "as-needed"
  ];
  
  if (validFrequencies.includes(freq as Equipment['maintenanceFrequency'])) {
    return freq as Equipment['maintenanceFrequency'];
  }
  
  // Default to as-needed if invalid
  console.warn(`Invalid maintenance frequency: ${freq}, defaulting to "as-needed"`);
  return "as-needed";
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
    
    return data.map(item => {
      // Process maintenance schedules if they exist
      let maintenanceSchedules: MaintenanceSchedule[] = [];
      
      if (item.maintenance_schedules && Array.isArray(item.maintenance_schedules)) {
        maintenanceSchedules = item.maintenance_schedules.map((schedule: any) => ({
          frequencyType: validateMaintenanceFrequency(schedule.frequencyType || 'as-needed'),
          nextDate: schedule.nextDate || '',
          description: schedule.description || '',
          estimatedDuration: parseInt(schedule.estimatedDuration) || 1,
          technician: schedule.technician,
          isRecurring: Boolean(schedule.isRecurring),
          notificationsEnabled: Boolean(schedule.notificationsEnabled),
          reminderDays: parseInt(schedule.reminderDays) || 7
        }));
      }
      
      // Process maintenance history if it exists
      let maintenanceHistory: MaintenanceRecord[] = [];
      
      if (item.maintenance_history && Array.isArray(item.maintenance_history)) {
        maintenanceHistory = item.maintenance_history.map((record: any) => ({
          id: record.id || '',
          date: record.date || '',
          technician: record.technician || '',
          description: record.description || '',
          cost: record.cost,
          notes: record.notes,
          workOrderId: record.workOrderId
        }));
      }

      // Convert workOrderHistory to string array if it exists
      let workOrderHistory: string[] = [];
      if (item.work_order_history && Array.isArray(item.work_order_history)) {
        workOrderHistory = item.work_order_history.map(id => String(id));
      }
      
      return {
        id: item.id,
        name: item.name,
        customer: item.customer,
        serialNumber: item.serial_number,
        model: item.model,
        manufacturer: item.manufacturer,
        category: item.category,
        status: validateStatus(item.status),
        purchaseDate: item.purchase_date,
        lastMaintenanceDate: item.last_maintenance_date,
        nextMaintenanceDate: item.next_maintenance_date,
        maintenanceFrequency: validateMaintenanceFrequency(item.maintenance_frequency),
        location: item.location,
        notes: item.notes,
        installDate: item.install_date,
        warrantyExpiryDate: item.warranty_expiry_date,
        warrantyStatus: validateWarrantyStatus(item.warranty_status),
        workOrderHistory,
        maintenanceHistory,
        maintenanceSchedules
      };
    });
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
