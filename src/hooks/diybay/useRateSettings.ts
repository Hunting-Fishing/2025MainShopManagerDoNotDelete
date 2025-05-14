
import { useToast } from '../use-toast';
import { useShopId } from '../useShopId';
import { 
  RateSettings, 
  saveRateSettings, 
  updateAllBayRates, 
  Bay
} from '@/services/diybay/diybayService';

/**
 * Hook to manage rate calculation settings for DIY bays
 */
export function useRateSettings(
  settings: RateSettings, 
  setSettings: (settings: RateSettings) => void,
  bays: Bay[],
  setBays: (bays: Bay[]) => void,
  setIsSaving: (isSaving: boolean) => void
) {
  const { shopId } = useShopId();
  const { toast } = useToast();

  const updateBayRateSettings = async (newSettings: RateSettings) => {
    if (!shopId) return false;
    
    setIsSaving(true);
    try {
      // Save the settings
      await saveRateSettings(
        {
          daily_hours: newSettings.daily_hours,
          daily_discount_percent: newSettings.daily_discount_percent,
          weekly_multiplier: newSettings.weekly_multiplier,
          monthly_multiplier: newSettings.monthly_multiplier
        }, 
        shopId, 
        newSettings.id || undefined
      );
      
      // Update all bays with new calculated rates
      const updatedBays = await updateAllBayRates(bays, newSettings);
      
      setSettings(newSettings);
      setBays(updatedBays);
      
      toast({
        title: "Success",
        description: "Rate calculation settings updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    updateBayRateSettings
  };
}
