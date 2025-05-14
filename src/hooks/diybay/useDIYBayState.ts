
import { useState, useEffect, useCallback } from 'react';
import { useShopId } from '../useShopId';
import { useToast } from '../use-toast';
import { Bay, RateSettings, fetchBays, fetchRateSettings } from '@/services/diybay/diybayService';

/**
 * Hook to manage the state of DIY bays and rate settings
 */
export function useDIYBayState() {
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

  return {
    bays,
    setBays,
    settings,
    setSettings,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    loadData
  };
}
