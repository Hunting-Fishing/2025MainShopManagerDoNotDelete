
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { RateSettings } from "@/services/diybay/diybayService";
import { useToast } from "@/hooks/use-toast";

export function useRateSettings(
  settings: RateSettings,
  setSettings: React.Dispatch<React.SetStateAction<RateSettings>>,
  bays: any[],
  setBays: React.Dispatch<React.SetStateAction<any[]>>,
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateBayRateSettings = async (updatedSettings: RateSettings) => {
    setIsSaving(true);
    setIsUpdating(true);
    
    try {
      // Update settings in DB
      const { data, error } = await supabase
        .from('diy_bay_rate_settings')
        .update({
          daily_hours: updatedSettings.daily_hours,
          daily_discount_percent: updatedSettings.daily_discount_percent,
          weekly_multiplier: updatedSettings.weekly_multiplier,
          monthly_multiplier: updatedSettings.monthly_multiplier,
          hourly_base_rate: updatedSettings.hourly_base_rate || null
        })
        .eq('id', updatedSettings.id)
        .select('*');
        
      if (error) throw error;
      
      setSettings(updatedSettings);
      
      // If hourly base rate was updated, update all bay rates
      if (updatedSettings.hourly_base_rate !== settings.hourly_base_rate) {
        // Update all bays with the new hourly base rate
        await updateAllBaysHourlyRate(Number(updatedSettings.hourly_base_rate));
      }
      
      toast({
        title: "Settings updated",
        description: "DIY bay rate settings have been saved successfully."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating rate settings:", error);
      toast({
        title: "Error",
        description: "Failed to update rate settings: " + error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
      setIsUpdating(false);
    }
  };
  
  // Function to update all bays with the new hourly rate
  const updateAllBaysHourlyRate = async (newHourlyRate: number) => {
    if (isNaN(newHourlyRate) || newHourlyRate <= 0) return;
    
    try {
      // Get all active bays
      const { data: activeBays, error: fetchError } = await supabase
        .from('diy_bay_rates')
        .select('*')
        .eq('is_active', true);
        
      if (fetchError) throw fetchError;
      
      // Update each bay with the new hourly rate
      for (const bay of activeBays || []) {
        await supabase
          .from('diy_bay_rates')
          .update({ hourly_rate: newHourlyRate })
          .eq('id', bay.id);
      }
      
      // Refresh bay data in the UI
      const { data: updatedBays } = await supabase
        .from('diy_bay_rates')
        .select('*')
        .order('bay_number', { ascending: true });
        
      if (updatedBays) {
        setBays(updatedBays);
      }
      
    } catch (error) {
      console.error("Error updating bay hourly rates:", error);
    }
  };

  return { updateBayRateSettings, isUpdating };
}
