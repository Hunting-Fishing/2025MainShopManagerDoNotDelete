
import { useState, useEffect } from 'react';
import { LoyaltySettings } from '@/types/loyalty';
import { useShopId } from '@/hooks/useShopId';
import { toast } from 'sonner';
import { getLoyaltySettings, updateLoyaltySettings, toggleLoyaltyProgramEnabled } from '@/services/loyalty';

export function useLoyaltySettings() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { shopId } = useShopId();

  useEffect(() => {
    const loadSettings = async () => {
      if (!shopId) return;
      
      setIsLoading(true);
      try {
        const settingsData = await getLoyaltySettings(shopId);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading loyalty settings:', error);
        toast.error('Failed to load loyalty program settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [shopId]);

  const handleSettingsChange = (field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: field === 'points_per_dollar' || field === 'points_expiration_days' 
        ? Number(value) 
        : value
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await updateLoyaltySettings(settings);
      toast.success('Loyalty settings saved successfully');
    } catch (error) {
      console.error('Error saving loyalty settings:', error);
      toast.error('Failed to save loyalty settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLoyalty = async (enabled: boolean) => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await toggleLoyaltyProgramEnabled(settings.id, enabled);
      setSettings({
        ...settings,
        is_enabled: enabled
      });
      toast.success(enabled ? 'Loyalty program enabled' : 'Loyalty program disabled');
    } catch (error) {
      console.error('Error toggling loyalty program:', error);
      toast.error('Failed to update loyalty program status');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    handleSettingsChange,
    handleSaveSettings,
    handleToggleLoyalty
  };
}
