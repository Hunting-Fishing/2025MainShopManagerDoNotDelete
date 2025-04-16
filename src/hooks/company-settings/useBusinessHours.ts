
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/settings/companyService';
import { handleApiError } from '@/utils/errorHandling';
import { BusinessHours } from '@/services/settings/companyService.types';

export function useBusinessHours() {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadBusinessHours = useCallback(async (shopId: string) => {
    if (!shopId) {
      console.warn("No shop ID provided to loadBusinessHours");
      return [];
    }
    
    try {
      setIsLoading(true);
      console.log("Loading business hours for shop ID:", shopId);
      
      const hours = await companyService.getBusinessHours(shopId);
      console.log("Loaded business hours:", hours);
      
      // Sort hours by day_of_week to ensure consistent display
      const sortedHours = [...(hours || [])].sort((a, b) => a.day_of_week - b.day_of_week);
      setBusinessHours(sortedHours);
      
      return sortedHours;
    } catch (error) {
      console.error("Failed to load business hours:", error);
      handleApiError(error, "Failed to load business hours");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBusinessHoursChange = (index: number, field: string, value: any) => {
    console.log("Business hours changed:", index, field, value);
    const newHours = [...businessHours];
    
    if (newHours[index]) {
      newHours[index][field] = value;
      setBusinessHours(newHours);
    } else {
      console.error(`Attempted to update hours at invalid index: ${index}`);
    }
  };

  return {
    businessHours,
    setBusinessHours,
    loadBusinessHours,
    handleBusinessHoursChange,
    isLoading
  };
}
