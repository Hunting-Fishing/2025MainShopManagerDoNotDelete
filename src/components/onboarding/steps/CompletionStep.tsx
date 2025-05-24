
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building, Clock, Users } from "lucide-react";
import { companyService } from "@/services/settings/companyService";
import { supabase } from "@/lib/supabase";

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

export function CompletionStep({ onNext, data }: StepProps) {
  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState<any>(null);
  const [businessHours, setBusinessHours] = useState<any[]>([]);

  useEffect(() => {
    fetchAndCombineData();
  }, []);

  const fetchAndCombineData = async () => {
    try {
      setLoading(true);
      
      // Get current user and shop ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) return;

      // Fetch company info with shop ID
      const companyInfo = await companyService.getShopInfo(profile.shop_id);
      console.log("CompletionStep: Company info from service:", companyInfo);
      
      // Fetch business hours
      const hours = await companyService.getBusinessHours(profile.shop_id);
      
      // Combine with form data from props, prioritizing form data
      const combinedData = {
        name: data?.shopName || companyInfo?.name || '',
        address: data?.address || companyInfo?.address || '',
        city: data?.city || companyInfo?.city || '',
        state: data?.state || companyInfo?.state || '',
        zip: data?.zip || companyInfo?.zip || '',
        phone: data?.phone || companyInfo?.phone || '',
        email: data?.email || companyInfo?.email || '',
        taxId: data?.taxId || companyInfo?.taxId || '',
        businessType: data?.businessType || companyInfo?.businessType || '',
        industry: data?.industry || companyInfo?.industry || '',
        logoUrl: companyInfo?.logoUrl || ''
      };
      
      setShopData(combinedData);
      setBusinessHours(hours || []);
      
    } catch (error) {
      console.error("CompletionStep: Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Get current user and shop ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) return;

      // Mark onboarding as complete
      await supabase
        .from('shops')
        .update({ 
          onboarding_completed: true,
          setup_step: 4
        })
        .eq('id', profile.shop_id);

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .upsert({
          shop_id: profile.shop_id,
          current_step: 4,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      onNext();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !shopData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading your information...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
        <p className="text-gray-600">
          Your shop profile is ready. Here's a summary of your information:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Building className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle className="text-lg">Shop Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p className="text-gray-900">{shopData?.name || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Address:</span>
              <p className="text-gray-900">
                {shopData?.address || shopData?.city || shopData?.state ? 
                  `${shopData?.address || ''} ${shopData?.city || ''} ${shopData?.state || ''} ${shopData?.zip || ''}`.trim() || 'Not provided'
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <p className="text-gray-900">{shopData?.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{shopData?.email || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Clock className="h-5 w-5 text-green-600 mr-2" />
            <CardTitle className="text-lg">Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {businessHours.length > 0 ? (
              <div className="space-y-2">
                {businessHours.map((hour, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-700">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][hour.day_of_week]}
                    </span>
                    <span className="text-gray-900">
                      {hour.is_closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Business hours not configured</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleComplete}
          disabled={loading}
          size="lg"
          className="px-8"
        >
          {loading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}
