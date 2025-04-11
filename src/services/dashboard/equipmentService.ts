
import { supabase } from "@/lib/supabase";
import { EquipmentRecommendation } from "@/types/dashboard";
import { Equipment } from "@/types/equipment";
import { addDays, differenceInDays, parseISO, isAfter } from "date-fns";

// Get equipment recommendations for dashboard
export const getEquipmentRecommendations = async (): Promise<EquipmentRecommendation[]> => {
  try {
    // Fetch equipment that needs maintenance or has issues
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .or('status.eq.maintenance-required,status.eq.out-of-service')
      .order('next_maintenance_date');
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Convert to equipment recommendations format
    return data.map(item => {
      // Determine priority based on equipment status and maintenance date
      let priority: "High" | "Medium" | "Low" = "Medium";
      
      if (item.status === "out-of-service") {
        priority = "High";
      } else if (item.status === "maintenance-required") {
        // Check if maintenance is overdue
        const nextMaintenanceDate = item.next_maintenance_date ? new Date(item.next_maintenance_date) : null;
        const today = new Date();
        
        if (nextMaintenanceDate && isAfter(today, nextMaintenanceDate)) {
          priority = "High";
        }
      }
      
      // Format maintenance date for display
      const maintenanceDate = item.next_maintenance_date 
        ? new Date(item.next_maintenance_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Not scheduled';
      
      // Determine maintenance type based on equipment data
      const maintenanceType = item.maintenance_frequency === 'as-needed' 
        ? 'General Maintenance' 
        : `${item.maintenance_frequency.charAt(0).toUpperCase()}${item.maintenance_frequency.slice(1)} Service`;
      
      return {
        id: item.id,
        name: item.name,
        model: item.model || 'Unknown model',
        manufacturer: item.manufacturer || 'Unknown manufacturer',
        status: item.status || 'operational',
        maintenanceType: maintenanceType,
        maintenanceDate: maintenanceDate,
        priority: priority
      };
    });
  } catch (error) {
    console.error("Error fetching equipment recommendations:", error);
    return [];
  }
};
