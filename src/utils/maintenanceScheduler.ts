
import { Equipment } from "@/types/equipment";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { addMonths, addDays, addYears, parseISO, format } from 'date-fns';

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
    // Create a real work order in the database
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        description: `Scheduled maintenance: ${schedule.description}`,
        customer_id: null, // Would need to map equipment to customer
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Error creating work order:", error);
      throw error;
    }
    
    // Return the actual ID
    return data.id;
  } catch (error) {
    console.error("Error scheduling maintenance work order:", error);
    throw error;
  }
};

// Calculate the next maintenance date based on frequency
export const calculateNextMaintenanceDate = (
  currentDate: string, 
  frequencyType: string
): string => {
  const dateObj = parseISO(currentDate);
  let nextDate: Date;
  
  switch (frequencyType) {
    case 'monthly':
      nextDate = addMonths(dateObj, 1);
      break;
    case 'quarterly':
      nextDate = addMonths(dateObj, 3);
      break;
    case 'bi-annually':
      nextDate = addMonths(dateObj, 6);
      break;
    case 'annually':
      nextDate = addYears(dateObj, 1);
      break;
    case 'as-needed':
    default:
      // For 'as-needed', we'll default to 3 months
      nextDate = addMonths(dateObj, 3);
      break;
  }
  
  return format(nextDate, 'yyyy-MM-dd');
};
