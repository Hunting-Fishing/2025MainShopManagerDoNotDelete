
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/settings/companyService';

export function useBusinessHours() {
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const { toast } = useToast();

  const loadBusinessHours = useCallback(async (shopId: string) => {
    try {
      const hours = await companyService.getBusinessHours(shopId);
      console.log("Loaded business hours:", hours);
      setBusinessHours(hours || []);
    } catch (error) {
      console.error("Failed to load business hours:", error);
      toast({
        title: "Error",
        description: "Failed to load business hours",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleBusinessHoursChange = (index: number, field: string, value: any) => {
    console.log("Business hours changed:", index, field, value);
    const newHours = [...businessHours];
    newHours[index][field] = value;
    setBusinessHours(newHours);
  };

  return {
    businessHours,
    setBusinessHours,
    loadBusinessHours,
    handleBusinessHoursChange
  };
}
