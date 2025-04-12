
import { supabase } from "@/lib/supabase";

async function getBusinessHours(shopId: string) {
  try {
    const { data, error } = await supabase
      .from('shop_hours')
      .select('*')
      .eq('shop_id', shopId)
      .order('day_of_week', { ascending: true });
      
    if (error) {
      console.error("Error fetching business hours:", error);
      throw error;
    }
    
    // If no business hours exist yet, create default business hours
    if (!data || data.length === 0) {
      const defaultHours = [];
      for (let i = 0; i < 7; i++) {
        defaultHours.push({
          day_of_week: i,
          open_time: '09:00:00',
          close_time: '17:00:00',
          is_closed: i === 0 || i === 6 // Default closed on weekends
        });
      }
      return defaultHours;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getBusinessHours:", error);
    throw error;
  }
}

async function updateBusinessHours(shopId: string, businessHours: any[]) {
  try {
    console.log("Updating business hours for shop", shopId, "with data:", businessHours);
    
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
    
    const { data, error } = await supabase
      .from('shop_hours')
      .insert(hoursToInsert);
      
    if (error) {
      console.error("Error inserting business hours:", error);
      throw error;
    }
    
    console.log("Business hours updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateBusinessHours:", error);
    throw error;
  }
}

export const businessHoursService = {
  getBusinessHours,
  updateBusinessHours
};
