
import { supabase } from "@/lib/supabase";
import { BusinessHours } from "./companyService.types";

async function getBusinessHours(shopId: string): Promise<BusinessHours[]> {
  try {
    console.log("Fetching business hours for shop:", shopId);
    
    if (!shopId) {
      console.error("No shop ID provided to getBusinessHours");
      throw new Error("Shop ID is required");
    }
    
    const { data, error } = await supabase
      .from('shop_hours')
      .select('*')
      .eq('shop_id', shopId)
      .order('day_of_week', { ascending: true });
      
    if (error) {
      console.error("Error fetching business hours:", error);
      throw error;
    }
    
    console.log("Raw business hours data:", data);
    
    // If no business hours exist yet, create default business hours
    if (!data || data.length === 0) {
      const defaultHours = [];
      for (let i = 0; i < 7; i++) {
        defaultHours.push({
          day_of_week: i,
          open_time: '09:00:00',
          close_time: '17:00:00',
          is_closed: i === 0 || i === 6, // Default closed on weekends
          shop_id: shopId
        });
      }
      return defaultHours;
    }
    
    // Filter out duplicate entries - keep only unique day_of_week values
    const uniqueHours = [];
    const dayMap = new Map();
    
    for (const hour of data) {
      if (!dayMap.has(hour.day_of_week)) {
        dayMap.set(hour.day_of_week, true);
        uniqueHours.push(hour);
      }
    }
    
    // Ensure all 7 days are represented
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    const existingDays = uniqueHours.map(h => h.day_of_week);
    
    for (const day of daysOfWeek) {
      if (!existingDays.includes(day)) {
        uniqueHours.push({
          day_of_week: day,
          open_time: '09:00:00',
          close_time: '17:00:00',
          is_closed: day === 0 || day === 6, // Default closed on weekends
          shop_id: shopId
        });
      }
    }
    
    // Sort by day of week
    uniqueHours.sort((a, b) => a.day_of_week - b.day_of_week);
    
    console.log("Processed business hours:", uniqueHours);
    
    return uniqueHours;
  } catch (error) {
    console.error("Error in getBusinessHours:", error);
    throw error;
  }
}

async function updateBusinessHours(shopId: string, businessHours: BusinessHours[]) {
  try {
    console.log("Updating business hours for shop", shopId);
    
    if (!shopId) {
      console.error("No shop ID provided to updateBusinessHours");
      throw new Error("Shop ID is required");
    }
    
    if (!businessHours || !Array.isArray(businessHours) || businessHours.length === 0) {
      console.error("Invalid business hours data:", businessHours);
      throw new Error("Valid business hours data is required");
    }
    
    // First, delete existing business hours
    const { error: deleteError } = await supabase
      .from('shop_hours')
      .delete()
      .eq('shop_id', shopId);
      
    if (deleteError) {
      console.error("Error deleting existing business hours:", deleteError);
      throw deleteError;
    }
    
    // Then insert new business hours
    const hoursToInsert = businessHours.map(hour => ({
      shop_id: shopId,
      day_of_week: hour.day_of_week,
      open_time: hour.open_time,
      close_time: hour.close_time,
      is_closed: hour.is_closed
    }));
    
    console.log("Inserting new business hours:", hoursToInsert);
    
    const { data, error } = await supabase
      .from('shop_hours')
      .insert(hoursToInsert)
      .select('*');
      
    if (error) {
      console.error("Error inserting business hours:", error);
      throw error;
    }
    
    console.log("Business hours updated successfully, returned data:", data);
    
    // Return the newly inserted hours to ensure state is up-to-date
    return data || hoursToInsert;
  } catch (error) {
    console.error("Error in updateBusinessHours:", error);
    throw error;
  }
}

export const businessHoursService = {
  getBusinessHours,
  updateBusinessHours
};
