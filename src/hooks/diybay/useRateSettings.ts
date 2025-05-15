
import { supabase } from "@/lib/supabase";
import { Bay, RateSettings, calculateRates } from "@/services/diybay/diybayService";
import { useToast } from "@/hooks/use-toast";
import { useShopId } from "@/hooks/useShopId";

export function useRateSettings(
  settings: RateSettings,
  setSettings: React.Dispatch<React.SetStateAction<RateSettings>>,
  bays: Bay[],
  setBays: React.Dispatch<React.SetStateAction<Bay[]>>,
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();
  const { shopId } = useShopId();

  const updateBayRateSettings = async (newSettings: RateSettings): Promise<boolean> => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "Unable to save settings: No shop ID found. Please refresh the page or contact support.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!settings.id) {
      toast({
        title: "Error",
        description: "Settings ID is missing. Please refresh the page or contact support.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Deep compare to ensure we have actual changes
      const hasChanges = JSON.stringify(newSettings) !== JSON.stringify(settings);
      
      if (!hasChanges) {
        toast({
          title: "Info",
          description: "No changes to save"
        });
        return true;
      }
      
      // Prepare data for update
      const updateData: Partial<RateSettings> = {};
      
      // Only include fields that have changed
      if (newSettings.daily_hours !== settings.daily_hours) {
        updateData.daily_hours = newSettings.daily_hours === '' ? 0 : Number(newSettings.daily_hours);
      }
      
      if (newSettings.daily_discount_percent !== settings.daily_discount_percent) {
        updateData.daily_discount_percent = newSettings.daily_discount_percent === '' ? 0 : Number(newSettings.daily_discount_percent);
      }
      
      if (newSettings.weekly_multiplier !== settings.weekly_multiplier) {
        updateData.weekly_multiplier = newSettings.weekly_multiplier === '' ? 0 : Number(newSettings.weekly_multiplier);
      }
      
      if (newSettings.monthly_multiplier !== settings.monthly_multiplier) {
        updateData.monthly_multiplier = newSettings.monthly_multiplier === '' ? 0 : Number(newSettings.monthly_multiplier);
      }
      
      if (newSettings.hourly_base_rate !== settings.hourly_base_rate) {
        updateData.hourly_base_rate = newSettings.hourly_base_rate === '' ? 0 : Number(newSettings.hourly_base_rate);
      }
      
      // Update settings in database if there are changes
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('diy_bay_rate_settings')
          .update(updateData)
          .eq('id', settings.id);
          
        if (error) throw error;
      }
      
      // Update local settings state
      setSettings(prev => ({
        ...prev,
        ...updateData
      }));
      
      // Recalculate rates for all bays using new settings
      const normalizedSettings = {
        ...settings,
        ...updateData
      };
      
      // Convert any string values to numbers for calculation
      Object.keys(normalizedSettings).forEach(key => {
        const field = key as keyof RateSettings;
        if (typeof normalizedSettings[field] === 'string' && normalizedSettings[field] !== '') {
          normalizedSettings[field] = Number(normalizedSettings[field]);
        }
        if (normalizedSettings[field] === '') {
          normalizedSettings[field] = 0;
        }
      });
      
      const updatedBays = bays.map(bay => {
        if (!bay.hourly_rate) return bay;
        
        const calculatedRates = calculateRates(bay.hourly_rate, normalizedSettings);
        
        return {
          ...bay,
          daily_rate: calculatedRates.daily,
          weekly_rate: calculatedRates.weekly,
          monthly_rate: calculatedRates.monthly
        };
      });
      
      // Update bays in database with new calculated rates
      for (const bay of updatedBays) {
        await supabase
          .from('diy_bay_rates')
          .update({
            daily_rate: bay.daily_rate,
            weekly_rate: bay.weekly_rate,
            monthly_rate: bay.monthly_rate
          })
          .eq('id', bay.id);
      }
      
      // Update local bays state
      setBays(updatedBays);
      
      toast({
        title: "Settings saved",
        description: "Rate settings have been updated successfully."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating rate settings:", error);
      toast({
        title: "Error",
        description: `Failed to update rate settings: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { updateBayRateSettings };
}
