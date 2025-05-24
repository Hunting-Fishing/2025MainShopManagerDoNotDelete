
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Clock, Settings, Users, FileText, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useShopId } from '@/hooks/useShopId';
import { toast } from '@/hooks/use-toast';

interface CompletionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
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
      // Get shop info
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (shopError) throw shopError;

      // Get business hours
      const { data: hours, error: hoursError } = await supabase
        .from('shop_hours')
        .select('*')
        .eq('shop_id', shopId)
        .order('day_of_week');

      if (hoursError) throw hoursError;

      // Get onboarding progress
      const { data: progress, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('shop_id', shopId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') throw progressError;

      setShopData({
        shop,
        hours: hours || [],
        progress: progress?.step_data || data
      });
    } catch (error) {
      console.error('Error loading shop data:', error);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      if (shopId) {
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

        toast({
          title: "Welcome to Easy Shop Manager!",
          description: "Your shop has been set up successfully.",
        });
        
        // Navigate to dashboard
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBusinessHours = (hours: any[]) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return hours.map(hour => {
      const dayName = dayNames[hour.day_of_week];
      if (hour.is_closed) {
        return `${dayName}: Closed`;
      }
      const openTime = hour.open_time?.slice(0, 5) || '09:00';
      const closeTime = hour.close_time?.slice(0, 5) || '17:00';
      return `${dayName}: ${openTime} - ${closeTime}`;
    }).join(', ');
  };

  const basicInfo = shopData?.progress?.basicInfo || data?.basicInfo || {};
  const businessSettings = shopData?.progress?.businessSettings || data?.businessSettings || {};
  const sampleDataInfo = shopData?.progress?.sampleData || data?.sampleData || {};

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Congratulations!
        </h2>
        <p className="text-lg text-gray-600">
          Your shop setup is complete and ready for business!
        </p>
      </div>

      {/* Setup Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Setup Summary
          </CardTitle>
          <CardDescription>
            Review your shop configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Shop Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {shopData?.shop?.name || basicInfo.name || 'Not provided'}</p>
                <p><span className="font-medium">Type:</span> {shopData?.shop?.business_type || basicInfo.businessType || 'Not specified'}</p>
                <p><span className="font-medium">Industry:</span> {shopData?.shop?.industry || basicInfo.industry || 'Not specified'}</p>
                <p><span className="font-medium">Email:</span> {shopData?.shop?.email || basicInfo.email || 'Not provided'}</p>
                <p><span className="font-medium">Phone:</span> {shopData?.shop?.phone || basicInfo.phone || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Address</h4>
              <div className="text-sm">
                {shopData?.shop?.address || basicInfo.address ? (
                  <div>
                    <p>{shopData?.shop?.address || basicInfo.address}</p>
                    <p>
                      {shopData?.shop?.city || basicInfo.city}{shopData?.shop?.city || basicInfo.city ? ', ' : ''}
                      {shopData?.shop?.state || basicInfo.state} {shopData?.shop?.postal_code || basicInfo.zip}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Address not provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Hours */}
          {shopData?.hours && shopData.hours.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Business Hours
              </h4>
              <p className="text-sm">{formatBusinessHours(shopData.hours)}</p>
            </div>
          )}

          {/* Settings */}
          {(businessSettings.laborRate || businessSettings.taxRate) && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Pricing Settings
              </h4>
              <div className="text-sm space-y-1">
                {businessSettings.laborRate && (
                  <p><span className="font-medium">Labor Rate:</span> ${businessSettings.laborRate}/hour</p>
                )}
                {businessSettings.taxRate && (
                  <p><span className="font-medium">Tax Rate:</span> {businessSettings.taxRate}%</p>
                )}
              </div>
            </div>
          )}

          {/* Features Enabled */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Features Enabled</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Customer Management</Badge>
              <Badge variant="secondary">Work Orders</Badge>
              <Badge variant="secondary">Invoicing</Badge>
              <Badge variant="secondary">Inventory Tracking</Badge>
              {businessSettings.appointmentBooking && <Badge variant="default">Online Booking</Badge>}
              {businessSettings.emailNotifications && <Badge variant="default">Email Notifications</Badge>}
              {businessSettings.smsNotifications && <Badge variant="default">SMS Notifications</Badge>}
              {sampleDataInfo.importCustomers && <Badge variant="outline">Sample Customers</Badge>}
              {sampleDataInfo.importInventory && <Badge variant="outline">Sample Inventory</Badge>}
              {sampleDataInfo.importServices && <Badge variant="outline">Sample Services</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>
            Get the most out of your new shop management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => navigate('/customers')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Manage Customers</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Add your existing customers and their vehicles
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => navigate('/work-orders')}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium">Create Work Orders</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Start managing your repair jobs efficiently
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => navigate('/inventory')}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Setup Inventory</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Add your parts and track stock levels
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => navigate('/settings')}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Configure Settings</span>
              </div>
              <span className="text-sm text-gray-600 text-left">
                Customize your shop preferences
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline">
          Previous
        </Button>
        <Button 
          onClick={handleCompleteOnboarding} 
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Completing Setup...' : 'Go to Dashboard'}
        </Button>
      </div>
    </div>
  );
}
