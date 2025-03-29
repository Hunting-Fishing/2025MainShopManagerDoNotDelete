
import { Equipment, MaintenanceSchedule } from "@/types/equipment";
import { WorkOrder } from "@/data/workOrdersData";
import { createWorkOrder } from "@/utils/workOrderUtils";
import { toast } from "@/hooks/use-toast";
import { addDays, format, parse, isBefore, isAfter } from "date-fns";
import { notificationService } from "@/services/notificationService";

// Calculate the next maintenance date based on frequency
export const calculateNextMaintenanceDate = (
  currentDate: string,
  frequency: MaintenanceSchedule["frequencyType"]
): string => {
  const date = parse(currentDate, "yyyy-MM-dd", new Date());
  let nextDate = new Date(date);

  switch (frequency) {
    case "monthly":
      nextDate.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(date.getMonth() + 3);
      break;
    case "bi-annually":
      nextDate.setMonth(date.getMonth() + 6);
      break;
    case "annually":
      nextDate.setFullYear(date.getFullYear() + 1);
      break;
    case "as-needed":
      // For as-needed, don't change the date
      break;
  }

  return format(nextDate, "yyyy-MM-dd");
};

// Check if maintenance is due for an equipment
export const isMaintenanceDue = (equipment: Equipment): boolean => {
  const today = new Date();
  const maintenanceDate = parse(equipment.nextMaintenanceDate, "yyyy-MM-dd", new Date());
  return isBefore(maintenanceDate, today);
};

// Check if maintenance is coming up soon (within the reminder period)
export const isMaintenanceUpcoming = (equipment: Equipment, reminderDays: number = 7): boolean => {
  const today = new Date();
  const reminderDate = addDays(today, reminderDays);
  const maintenanceDate = parse(equipment.nextMaintenanceDate, "yyyy-MM-dd", new Date());
  
  return isAfter(maintenanceDate, today) && isBefore(maintenanceDate, reminderDate);
};

// Schedule maintenance for equipment
export const scheduleMaintenanceWorkOrder = async (
  equipment: Equipment,
  schedule: MaintenanceSchedule,
  customDescription?: string
): Promise<WorkOrder | null> => {
  try {
    // Create a work order for the maintenance
    const workOrderData = {
      customer: equipment.customer,
      description: customDescription || `Scheduled maintenance: ${schedule.description} for ${equipment.name}`,
      status: "pending" as const,
      priority: "medium" as const,
      technician: schedule.technician || "Unassigned",
      location: equipment.location,
      dueDate: parse(schedule.nextDate, "yyyy-MM-dd", new Date()),
      notes: `Scheduled maintenance for ${equipment.name} (${equipment.model}).\nEstimated duration: ${schedule.estimatedDuration} hours.`,
    };

    const newWorkOrder = await createWorkOrder(workOrderData);

    if (newWorkOrder) {
      toast({
        title: "Maintenance Scheduled",
        description: `Maintenance has been scheduled for ${equipment.name} on ${schedule.nextDate}.`,
        variant: "success",
      });

      // If we have the notification service available and notifications are enabled for this schedule
      if (schedule.notificationsEnabled) {
        notificationService.getInstance().triggerDemoNotification();
      }

      return newWorkOrder;
    }
  } catch (error) {
    console.error("Error scheduling maintenance:", error);
    toast({
      title: "Error",
      description: "Failed to schedule maintenance. Please try again.",
      variant: "destructive",
    });
  }

  return null;
};

// Get all upcoming maintenance for all equipment
export const getUpcomingMaintenanceSchedules = (
  equipmentList: Equipment[],
  daysAhead: number = 30
): { equipment: Equipment; dueDate: string }[] => {
  const today = new Date();
  const futureDate = addDays(today, daysAhead);
  
  const upcomingMaintenance: { equipment: Equipment; dueDate: string }[] = [];
  
  equipmentList.forEach(equipment => {
    const maintenanceDate = parse(equipment.nextMaintenanceDate, "yyyy-MM-dd", new Date());
    
    if (isAfter(maintenanceDate, today) && isBefore(maintenanceDate, futureDate)) {
      upcomingMaintenance.push({
        equipment,
        dueDate: equipment.nextMaintenanceDate
      });
    }

    // Also check additional maintenance schedules if they exist
    if (equipment.maintenanceSchedules) {
      equipment.maintenanceSchedules.forEach(schedule => {
        const scheduleDate = parse(schedule.nextDate, "yyyy-MM-dd", new Date());
        
        if (isAfter(scheduleDate, today) && isBefore(scheduleDate, futureDate)) {
          upcomingMaintenance.push({
            equipment,
            dueDate: schedule.nextDate
          });
        }
      });
    }
  });
  
  // Sort by due date (ascending)
  return upcomingMaintenance.sort((a, b) => {
    const dateA = parse(a.dueDate, "yyyy-MM-dd", new Date());
    const dateB = parse(b.dueDate, "yyyy-MM-dd", new Date());
    return dateA.getTime() - dateB.getTime();
  });
};
