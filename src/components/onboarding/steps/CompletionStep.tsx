
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { companyService } from '@/services/settings/companyService';

interface CompletionStepProps {
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  formData?: any;
}

export function CompletionStep({ onNext, onBack, isLoading, formData }: CompletionStepProps) {
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        console.log('CompletionStep: Fetching shop data...');
        console.log('CompletionStep: Form data received:', formData);
        
        const { companyInfo } = await companyService.getShopInfo();
        console.log('CompletionStep: Company info from service:', companyInfo);
        
        // Combine data from multiple sources, prioritizing form data
        const combinedData = {
          name: formData?.companyName || companyInfo?.name || 'Your Shop',
          email: formData?.email || companyInfo?.email || '',
          phone: formData?.phone || companyInfo?.phone || '',
          address: formData?.address || companyInfo?.address || '',
          city: formData?.city || companyInfo?.city || '',
          state: formData?.state || companyInfo?.state || '',
          zip: formData?.zip || companyInfo?.zip || '',
          businessType: formData?.businessType || companyInfo?.businessType || '',
          industry: formData?.industry || companyInfo?.industry || ''
        };
        
        console.log('CompletionStep: Combined data:', combinedData);
        setShopData(combinedData);
      } catch (error) {
        console.error('CompletionStep: Error fetching shop data:', error);
        // Use form data as fallback
        if (formData) {
          setShopData({
            name: formData.companyName || 'Your Shop',
            email: formData.email || '',
            phone: formData.phone || '',
            address: formData.address || '',
            city: formData.city || '',
            state: formData.state || '',
            zip: formData.zip || '',
            businessType: formData.businessType || '',
            industry: formData.industry || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [formData]);

  const handleComplete = async () => {
    console.log('CompletionStep: Completing onboarding...');
    onNext();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
        <p className="text-gray-600">
          Your shop is now configured and ready to use. Review your information below.
        </p>
      </div>

      {/* Shop Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Shop Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              <div className="space-y-1 text-sm">
                {shopData?.name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{shopData.name}</span>
                  </div>
                )}
                {shopData?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{shopData.email}</span>
                  </div>
                )}
                {shopData?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{shopData.phone}</span>
                  </div>
                )}
                {(shopData?.address || shopData?.city || shopData?.state || shopData?.zip) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Address:</span>
                      <div className="text-gray-600">
                        {shopData.address && <div>{shopData.address}</div>}
                        {(shopData.city || shopData.state || shopData.zip) && (
                          <div>
                            {[shopData.city, shopData.state, shopData.zip].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Business Details</h4>
              <div className="space-y-2">
                {shopData?.businessType && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Business Type:</span>
                    <Badge variant="outline" className="ml-2">{shopData.businessType}</Badge>
                  </div>
                )}
                {shopData?.industry && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Industry:</span>
                    <Badge variant="outline" className="ml-2">{shopData.industry}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Debug Information */}
          {(!shopData?.name && !shopData?.email && !shopData?.phone) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                No shop information found. Please ensure you've completed the basic information step.
              </p>
              <details className="mt-2">
                <summary className="text-xs text-yellow-700 cursor-pointer">Debug Info</summary>
                <pre className="text-xs mt-1 text-yellow-700">
                  {JSON.stringify({ formData, shopData }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Start creating work orders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Add customers and vehicles
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Set up your inventory
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Configure team members
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button 
          onClick={handleComplete} 
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}
