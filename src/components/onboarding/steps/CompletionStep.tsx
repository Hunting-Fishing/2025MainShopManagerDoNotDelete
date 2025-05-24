
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CompletionStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  data?: any;
}

export function CompletionStep({ onNext, onPrevious, data }: CompletionStepProps) {
  const navigate = useNavigate();
  const { shopId } = useShopId();
  const [isLoading, setIsLoading] = useState(false);
  const [shopData, setShopData] = useState<any>(null);

  useEffect(() => {
    loadShopData();
  }, [shopId]);

  const loadShopData = async () => {
    if (!shopId) return;

    try {
      console.log('Loading shop data for completion step, shopId:', shopId);
      
      // Get shop info
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (shopError) {
        console.error('Error fetching shop:', shopError);
        throw shopError;
      }

      // Get business hours
      const { data: hours, error: hoursError } = await supabase
        .from('shop_hours')
        .select('*')
        .eq('shop_id', shopId)
        .order('day_of_week');

      if (hoursError && hoursError.code !== 'PGRST116') {
        console.error('Error fetching hours:', hoursError);
      }

      // Get onboarding progress
      const { data: progress, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('shop_id', shopId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching progress:', progressError);
      }

      const combinedData = {
        shop,
        hours: hours || [],
        progress: progress?.step_data || data || {}
      };

      console.log('Loaded shop data for completion:', combinedData);
      setShopData(combinedData);
    } catch (error) {
      console.error('Error loading shop data:', error);
      // If we can't load from database, fall back to the passed data
      if (data) {
        setShopData({
          shop: null,
          hours: [],
          progress: data
        });
      }
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      if (shopId) {
        console.log('Completing onboarding for shop:', shopId);
        
        // Mark onboarding as complete
        await supabase
          .from('shops')
          .update({
            onboarding_completed: true,
            setup_step: 4
          })
          .eq('id', shopId);

        await supabase
          .from('onboarding_progress')
          .update({
            is_completed: true,
            current_step: 4,
            completed_steps: [0, 1, 2, 3]
          })
          .eq('shop_id', shopId);

        toast.success("Welcome to Easy Shop Manager!", {
          description: "Your shop has been set up successfully."
        });

        // Navigate to dashboard
        navigate('/');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Error", {
        description: "Failed to complete setup. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBusinessHours = (hours: any[]) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (!hours || hours.length === 0) {
      return 'Business hours not set';
    }

    return hours.map((hour) => {
      const dayName = dayNames[hour.day_of_week];
      if (hour.is_closed) {
        return `${dayName}: Closed`;
      }
      const openTime = hour.open_time?.slice(0, 5) || '09:00';
      const closeTime = hour.close_time?.slice(0, 5) || '17:00';
      return `${dayName}: ${openTime} - ${closeTime}`;
    }).join(', ');
  };

  // Get data from multiple sources, prioritizing the most complete data
  const displayData = shopData?.progress || data || {};
  const shopInfo = shopData?.shop;
  const businessHours = shopData?.hours || [];

  // Extract information from different possible data structures
  const basicInfo = displayData.basicInfo || displayData || {};
  const businessSettings = displayData.businessSettings || {};
  const sampleDataInfo = displayData.sampleData || {};

  console.log('Rendering completion step with data:', {
    displayData,
    basicInfo,
    businessSettings,
    sampleDataInfo,
    shopInfo
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Congratulations!
        </h2>
        <p className="text-gray-600">
          Your shop setup is complete! Here's a summary of your information:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Shop Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {shopInfo?.name || basicInfo.shopName || 'Not provided'}</p>
            <p><span className="font-medium">Address:</span> {shopInfo?.address || basicInfo.address || 'Not provided'}</p>
            <p><span className="font-medium">Phone:</span> {shopInfo?.phone || basicInfo.phone || 'Not provided'}</p>
            <p><span className="font-medium">Email:</span> {shopInfo?.email || basicInfo.email || 'Not provided'}</p>
            <p><span className="font-medium">Business Type:</span> {shopInfo?.business_type || basicInfo.businessType || 'Not provided'}</p>
            <p><span className="font-medium">Industry:</span> {shopInfo?.industry || basicInfo.industry || 'Not provided'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Business Settings</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Hours:</span></p>
            <p className="text-xs text-gray-600 ml-2">
              {formatBusinessHours(businessHours)}
            </p>
            <p><span className="font-medium">Sample Data:</span> {sampleDataInfo.includeSampleData ? 'Included' : 'Not included'}</p>
            <p><span className="font-medium">Setup Step:</span> {shopInfo?.setup_step || 'Complete'}</p>
          </div>
        </div>
      </div>

      {/* Debug information - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <pre className="text-xs text-yellow-700 overflow-auto max-h-32">
            {JSON.stringify({ displayData, shopInfo, businessHours }, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
        >
          Back
        </Button>
        
        <Button
          onClick={handleCompleteOnboarding}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
              Finishing Setup...
            </span>
          ) : (
            'Complete Setup & Go to Dashboard'
          )}
        </Button>
      </div>
    </div>
  );
}
