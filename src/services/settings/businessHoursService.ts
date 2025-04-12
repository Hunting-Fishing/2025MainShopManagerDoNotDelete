
import { supabase } from "@/lib/supabase";

export const businessHoursService = {
  async getBusinessHours(shopId: string) {
    try {
      const { data, error } = await supabase
        .from("shop_hours")
        .select("*")
        .eq("shop_id", shopId)
        .order("day_of_week");
        
      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return data;
      }
      
      // Return default hours if none exist
      return [
        { day_of_week: 0, open_time: "10:00:00", close_time: "15:00:00", is_closed: false },
        { day_of_week: 1, open_time: "09:00:00", close_time: "17:00:00", is_closed: false },
        { day_of_week: 2, open_time: "09:00:00", close_time: "17:00:00", is_closed: false },
        { day_of_week: 3, open_time: "09:00:00", close_time: "17:00:00", is_closed: false },
        { day_of_week: 4, open_time: "09:00:00", close_time: "17:00:00", is_closed: false },
        { day_of_week: 5, open_time: "09:00:00", close_time: "17:00:00", is_closed: false },
        { day_of_week: 6, open_time: "00:00:00", close_time: "00:00:00", is_closed: true }
      ];
    } catch (error) {
      console.error("Error fetching business hours:", error);
      throw error;
    }
  },

  async updateBusinessHours(shopId: string, businessHours: any[]) {
    try {
      // Save business hours
      for (const hours of businessHours) {
        const { error: hoursError } = await supabase
          .from("shop_hours")
          .upsert({
            shop_id: shopId,
            day_of_week: hours.day_of_week,
            open_time: hours.open_time,
            close_time: hours.close_time,
            is_closed: hours.is_closed,
            updated_at: new Date().toISOString()
          });
          
        if (hoursError) {
          throw hoursError;
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating business hours:", error);
      throw error;
    }
  }
};
