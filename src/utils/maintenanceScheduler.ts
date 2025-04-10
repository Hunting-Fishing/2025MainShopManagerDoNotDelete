
import { Equipment } from "@/types/equipment";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

// Get upcoming maintenance schedules from equipment list
export const getUpcomingMaintenanceSchedules = (
  equipmentList: Equipment[],
  days: number = 30
): Array<{ equipment: Equipment; dueDate: string }> => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  const upcomingMaintenance: Array<{ equipment: Equipment; dueDate: string }> = [];
  
  // First add based on nextMaintenanceDate field
  equipmentList.forEach(equipment => {
    if (equipment.nextMaintenanceDate) {
      const nextDate = new Date(equipment.nextMaintenanceDate);
      
      if (nextDate >= today && nextDate <= futureDate) {
        upcomingMaintenance.push({
          equipment,
          dueDate: equipment.nextMaintenanceDate
        });
      }
    }
  });
  
  // Then add from maintenance schedules
  equipmentList.forEach(equipment => {
    if (equipment.maintenanceSchedules && Array.isArray(equipment.maintenanceSchedules)) {
      equipment.maintenanceSchedules.forEach(schedule => {
        if (schedule.nextDate) {
          const scheduleDate = new Date(schedule.nextDate);
          
          if (scheduleDate >= today && scheduleDate <= futureDate) {
            // Check if we already have this equipment with this exact date
            const exists = upcomingMaintenance.some(
              item => item.equipment.id === equipment.id && item.dueDate === schedule.nextDate
            );
            
            if (!exists) {
              upcomingMaintenance.push({
                equipment,
                dueDate: schedule.nextDate
              });
            }
          }
        }
      });
    }
  });
  
  // Sort by date (closest first)
  return upcomingMaintenance.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

// Schedule maintenance work order
export const scheduleMaintenanceWorkOrder = async (
  equipment: Equipment,
  schedule: any
): Promise<string> => {
  try {
    // In a real implementation, this would create a work order in the database
    // For now, we'll mock it
    console.log(`Creating work order for ${equipment.name} maintenance: ${schedule.description}`);
    
    // Mock ID
    return uuidv4();
  } catch (error) {
    console.error("Error scheduling maintenance work order:", error);
    throw error;
  }
};
