
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";
import { companyService } from "@/services/settings/companyService";
import { businessHoursService } from "@/services/settings/businessHoursService";

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

export const CompletionStep: React.FC<StepProps> = ({ onNext, onPrevious, data, updateData }) => {
  const [combinedData, setCombinedData] = useState<any>({});
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAndCombineData = async () => {
      try {
        console.log("CompletionStep: Fetching shop data...");
        console.log("CompletionStep: Form data received:", { _type: typeof data, value: data });
        
        // Fetch company info from service
        const { companyInfo } = await companyService.getShopInfo();
        console.log("CompletionStep: Company info from service:", companyInfo);
        
        // Fetch business hours
        const hours = await businessHoursService.getBusinessHours();
        setBusinessHours(hours);
        
        // Combine data: prioritize form data, then database data
        const combined = {
          name: data?.name || companyInfo?.name || '',
          email: data?.email || companyInfo?.email || '',
          phone: data?.phone || companyInfo?.phone || '',
          address: data?.address || companyInfo?.address || '',
          city: data?.city || companyInfo?.city || '',
          state: data?.state || companyInfo?.state || '',
          zip: data?.zip || companyInfo?.zip || '',
          businessType: data?.businessType || companyInfo?.businessType || '',
          industry: data?.industry || companyInfo?.industry || '',
        };
        
        console.log("CompletionStep: Combined data:", combined);
        setCombinedData(combined);
        
      } catch (error) {
        console.error("CompletionStep: Error fetching data:", error);
        // Fallback to form data only
        setCombinedData(data || {});
      }
    };

    fetchAndCombineData();
  }, [data]);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // The completion logic will be handled by the parent wizard
      onNext();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBusinessHours = (hours: any[]) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return hours.map(hour => {
      const dayName = daysOfWeek[hour.day_of_week];
      if (hour.is_closed) {
        return `${dayName}: Closed`;
      }
      return `${dayName}: ${hour.open_time} - ${hour.close_time}`;
    }).join('\n');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900">Setup Complete!</h1>
        <p className="text-lg text-gray-600">
          Your shop information has been configured. Please review the details below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shop Information */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900 mt-1">{combinedData.name || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email:
                </span>
                <p className="text-gray-900 mt-1">{combinedData.email || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone:
                </span>
                <p className="text-gray-900 mt-1">{combinedData.phone || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Address:
                </span>
                <p className="text-gray-900 mt-1">
                  {combinedData.address && (combinedData.city || combinedData.state) 
                    ? `${combinedData.address}, ${combinedData.city} ${combinedData.state} ${combinedData.zip}`.trim()
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  Business Type:
                </span>
                <p className="text-gray-900 mt-1">{combinedData.businessType || 'Not provided'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Industry:</span>
                <p className="text-gray-900 mt-1">{combinedData.industry || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {businessHours.length > 0 ? (
              <div className="space-y-2 text-sm">
                <pre className="whitespace-pre-line text-gray-900 font-mono">
                  {formatBusinessHours(businessHours)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500 italic">Business hours not configured</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          Back
        </Button>
        
        <Button
          onClick={handleComplete}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
        >
          {isLoading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};
