
import { useShopId } from '../useShopId';
import { useToast } from '../use-toast';
import { Bay, RateSettings } from '@/services/diybay/diybayService';
import { supabase } from '@/lib/supabase';

/**
 * Hook to handle DIY bay CRUD operations
 */
export function useDIYBayOperations(bays: Bay[], setBays: (bays: Bay[]) => void, setIsSaving: (isSaving: boolean) => void) {
  const { shopId } = useShopId();
  const { toast } = useToast();

  const addBay = async (bayName: string) => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "Shop ID not available. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
    
    setIsSaving(true);
    try {
      console.log("Starting to add bay:", bayName, "for shop:", shopId);
      
      // Default hourly rate and calculations
      const hourlyRate = 65; // Default hourly rate
      const dailyRate = hourlyRate * 8 * 0.75; // 8 hours with 25% discount
      const weeklyRate = hourlyRate * 20; // 20x multiplier
      const monthlyRate = hourlyRate * 40; // 40x multiplier
      
      // Create the bay in the database
      const { data: newBay, error } = await supabase
        .from('diy_bay_rates')
        .insert({
          bay_name: bayName || `Bay ${bays.length + 1}`,
          bay_location: '',
          hourly_rate: hourlyRate,
          daily_rate: dailyRate,
          weekly_rate: weeklyRate,
          monthly_rate: monthlyRate,
          is_active: true,
          bay_number: bays.length + 1,
          bay_type: 'standard',
          shop_id: shopId
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      console.log("Successfully created bay:", newBay);
      setBays([...bays, newBay]);
      
      toast({
        title: "Success",
        description: "New bay added successfully.",
      });
      
      return newBay;
    } catch (error) {
      console.error('Error adding bay:', error);
      toast({
        title: "Error",
        description: "Failed to add new bay. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save bay changes
   * @returns Promise<boolean> indicating success or failure
   */
  const saveBay = async (bay: Bay): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('diy_bay_rates')
        .update({
          bay_name: bay.bay_name,
          bay_location: bay.bay_location,
          hourly_rate: bay.hourly_rate,
          daily_rate: bay.daily_rate,
          weekly_rate: bay.weekly_rate,
          monthly_rate: bay.monthly_rate,
          is_active: bay.is_active
        })
        .eq('id', bay.id);
        
      if (error) throw error;
      
      const updatedBays = bays.map((b) => b.id === bay.id ? bay : b);
      setBays(updatedBays);
      
      toast({
        title: "Success",
        description: `${bay.bay_name} has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating bay:', error);
      toast({
        title: "Error",
        description: "Failed to update bay. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const removeBay = async (bayId: string, bayName: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('diy_bay_rates')
        .delete()
        .eq('id', bayId);
        
      if (error) throw error;
      
      const updatedBays = bays.filter((bay) => bay.id !== bayId);
      setBays(updatedBays);
      
      toast({
        title: "Success",
        description: `${bayName} has been deleted.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting bay:', error);
      toast({
        title: "Error",
        description: "Failed to delete bay. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to calculate rates based on hourly rate and settings
  const calculateRates = (hourlyRate: number, settings: RateSettings) => {
    // Calculate daily rate (hourly rate * daily hours - discount)
    const baseDaily = hourlyRate * settings.daily_hours;
    const discount = baseDaily * (settings.daily_discount_percent / 100);
    const daily = baseDaily - discount;
    
    // Calculate weekly and monthly rates using multipliers
    const weekly = hourlyRate * settings.weekly_multiplier;
    const monthly = hourlyRate * settings.monthly_multiplier;
    
    return {
      daily,
      weekly,
      monthly
    };
  };

  return {
    addBay,
    saveBay,
    removeBay,
    calculateRates
  };
}
