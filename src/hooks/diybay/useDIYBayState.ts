
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useShopId } from "@/hooks/useShopId";
import { useToast } from "@/hooks/use-toast";
import { Bay, RateSettings } from "@/services/diybay/diybayService";

export function useDIYBayState() {
  const [bays, setBays] = useState<Bay[]>([]);
  const [settings, setSettings] = useState<RateSettings>({
    daily_hours: 8,
    daily_discount_percent: 25,
    weekly_multiplier: 20,
    monthly_multiplier: 40,
    hourly_base_rate: 65 // Default hourly base rate
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { shopId } = useShopId();
  const { toast } = useToast();

  const loadData = async () => {
    if (!shopId) return;
    
    setIsLoading(true);
    try {
      // Fetch bays data
      const { data: baysData, error: baysError } = await supabase
        .from('diy_bay_rates')
        .select('*')
        .eq('shop_id', shopId)
        .order('bay_number', { ascending: true });
        
      if (baysError) throw baysError;
      
      // Fetch settings data
      const { data: settingsData, error: settingsError } = await supabase
        .from('diy_bay_rate_settings')
        .select('*')
        .eq('shop_id', shopId)
        .single();
        
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      
      // Update state with fetched data
      if (baysData) setBays(baysData);
      if (settingsData) {
        setSettings({
          id: settingsData.id,
          daily_hours: settingsData.daily_hours,
          daily_discount_percent: settingsData.daily_discount_percent,
          weekly_multiplier: settingsData.weekly_multiplier,
          monthly_multiplier: settingsData.monthly_multiplier,
          hourly_base_rate: settingsData.hourly_base_rate || 65 // Use default if not set
        });
      } else {
        // Create default settings if none exist
        await createDefaultSettings();
      }
      
    } catch (error: any) {
      console.error("Error loading DIY bay data:", error);
      toast({
        title: "Error",
        description: "Failed to load DIY bay data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createDefaultSettings = async () => {
    if (!shopId) return;
    
    try {
      const { data, error } = await supabase
        .from('diy_bay_rate_settings')
        .insert({
          shop_id: shopId,
          daily_hours: 8,
          daily_discount_percent: 25,
          weekly_multiplier: 20,
          monthly_multiplier: 40,
          hourly_base_rate: 65 // Default hourly base rate
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      if (data) {
        setSettings({
          id: data.id,
          daily_hours: data.daily_hours,
          daily_discount_percent: data.daily_discount_percent,
          weekly_multiplier: data.weekly_multiplier,
          monthly_multiplier: data.monthly_multiplier,
          hourly_base_rate: data.hourly_base_rate
        });
      }
      
    } catch (error) {
      console.error("Error creating default settings:", error);
    }
  };

  useEffect(() => {
    if (shopId) {
      loadData();
    }
  }, [shopId]);

  return {
    bays,
    setBays,
    settings,
    setSettings,
    isLoading,
    isSaving,
    setIsSaving,
    loadData
  };
}
