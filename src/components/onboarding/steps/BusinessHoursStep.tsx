
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BusinessHoursSection } from '@/components/settings/company/BusinessHoursSection';
import { companyService, type BusinessHours } from '@/services/settings/companyService';
import { useShopData } from '@/hooks/useShopData';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

export function BusinessHoursStep({ onNext, onPrevious, data, updateData }: StepProps) {
  const { shopData } = useShopData();
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing business hours or create defaults
  useEffect(() => {
    const loadBusinessHours = async () => {
      if (!shopData?.id) return;
      
      try {
        const hours = await companyService.getBusinessHours(shopData.id);
        if (hours.length > 0) {
          setBusinessHours(hours);
        } else {
          // Create default business hours
          const defaultHours: BusinessHours[] = Array.from({ length: 7 }, (_, index) => ({
            shop_id: shopData.id,
            day_of_week: index,
            open_time: "09:00:00",
            close_time: "17:00:00",
            is_closed: index === 0 || index === 6 // Sunday and Saturday closed by default
          }));
          setBusinessHours(defaultHours);
        }
      } catch (error) {
        console.error('Failed to load business hours:', error);
        // Create default hours on error
        const defaultHours: BusinessHours[] = Array.from({ length: 7 }, (_, index) => ({
          shop_id: shopData?.id || '',
          day_of_week: index,
          open_time: "09:00:00",
          close_time: "17:00:00",
          is_closed: index === 0 || index === 6
        }));
        setBusinessHours(defaultHours);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessHours();
  }, [shopData?.id]);

  const handleBusinessHoursChange = (hours: BusinessHours[]) => {
    setBusinessHours(hours);
  };

  const handleNext = async () => {
    if (!shopData?.id) return;
    
    try {
      // Save business hours to database
      await companyService.updateBusinessHours(shopData.id, businessHours);
      updateData({ businessHours });
      onNext();
    } catch (error) {
      console.error('Failed to save business hours:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading business hours...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Set Your Business Hours</h3>
        <p className="text-gray-600 mb-6">
          Configure when your shop is open to customers. You can always change these later.
        </p>
      </div>

      <BusinessHoursSection
        businessHours={businessHours}
        onBusinessHoursChange={handleBusinessHoursChange}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
