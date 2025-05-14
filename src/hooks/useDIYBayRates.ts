
import { useState, useEffect, useCallback } from 'react';
import { useShopId } from './useShopId';
import { useToast } from './use-toast';
import {
  Bay, 
  RateSettings,
  RateHistory,
  fetchBays,
  fetchRateSettings,
  createBay,
  updateBay,
  deleteBay,
  fetchRateHistory,
  saveRateSettings,
  calculateRates,
  updateAllBayRates
} from '@/services/diybay/diybayService';

export function useDIYBayRates() {
  const [bays, setBays] = useState<Bay[]>([]);
  const [settings, setSettings] = useState<RateSettings>({
    id: '',
    daily_hours: 8,
    daily_discount_percent: 0,
    weekly_multiplier: 5,
    monthly_multiplier: 20
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  
  const { shopId } = useShopId();
  const { toast } = useToast();

  // Load bay data and settings
  const loadData = useCallback(async () => {
    if (!shopId) return;
    
    setIsLoading(true);
    try {
      const [baysData, settingsData] = await Promise.all([
        fetchBays(shopId),
        fetchRateSettings(shopId)
      ]);
      
      console.log("Loaded bays:", baysData);
      console.log("Loaded settings:", settingsData);
      
      setBays(baysData || []);
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading DIY bay data:', error);
      toast({
        title: "Error",
        description: "Failed to load DIY bay data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [shopId, toast]);

  // Initial data load
  useEffect(() => {
    if (shopId) {
      loadData();
    }
  }, [shopId, loadData]);

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
      const rates = calculateRates(hourlyRate, settings);
      
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

  const loadRateHistory = async (bayId: string) => {
    try {
      const history = await fetchRateHistory(bayId);
      console.log("Loaded rate history:", history);
      setRateHistory(history);
      return history;
    } catch (error) {
      console.error('Error fetching rate history:', error);
      toast({
        title: "Error",
        description: "Could not load rate history.",
        variant: "destructive",
      });
      return [];
    }
  };

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

  const calculateRate = (type: 'daily' | 'weekly' | 'monthly', hourlyRate: number) => {
    const rates = calculateRates(hourlyRate, settings);
    return rates[type];
  };

  return {
    bays,
    settings,
    isLoading,
    isSaving,
    rateHistory,
    loadData,
    addBay,
    saveBay,
    removeBay,
    loadRateHistory,
    updateBayRateSettings,
    calculateRate,
  };
}
