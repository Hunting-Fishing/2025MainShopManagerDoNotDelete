
import { useState } from 'react';
import { useShopId } from '../useShopId';
import { useToast } from '../use-toast';
import { 
  Bay, 
  createBay, 
  updateBay, 
  deleteBay,
  calculateRates 
} from '@/services/diybay/diybayService';

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
      // Calculate rates based on current settings
      const hourlyRate = 65; // Default hourly rate
      const rates = calculateRates(hourlyRate, {
        id: '',
        daily_hours: 8,
        daily_discount_percent: 0,
        weekly_multiplier: 5,
        monthly_multiplier: 20
      });
      
      const newBay = await createBay({
        bay_name: bayName || `Bay ${bays.length + 1}`,
        bay_location: '',
        hourly_rate: hourlyRate,
        daily_rate: rates.daily,
        weekly_rate: rates.weekly,
        monthly_rate: rates.monthly,
        is_active: true
      }, shopId);
      
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

  const saveBay = async (bay: Bay) => {
    setIsSaving(true);
    try {
      await updateBay(bay);
      
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
      await deleteBay(bayId);
      
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

  return {
    addBay,
    saveBay,
    removeBay
  };
}
