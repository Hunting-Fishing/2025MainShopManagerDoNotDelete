
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Building2, MapPin, Phone, Mail, FileText, Briefcase, Globe } from 'lucide-react';
import { companyService, type CompanyInfo } from '@/services/settings/companyService';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

export function CompletionStep({ onNext, onPrevious, data, updateData }: StepProps) {
  const [shopData, setShopData] = useState<{ shopId: string; companyInfo: CompanyInfo } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoading(true);
        const result = await companyService.getShopInfo();
        console.log('Fetched shop data:', result);
        setShopData(result);
      } catch (error) {
        console.error('Error fetching shop info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching your shop information...</p>
        </div>
      </div>
    );
  }

  // Combine form data with fetched data, prioritizing form data
  const displayData = {
    name: data?.name || shopData?.companyInfo?.name || 'Not provided',
    address: data?.address || shopData?.companyInfo?.address || 'Not provided',
    city: data?.city || shopData?.companyInfo?.city || 'Not provided',
    state: data?.state || shopData?.companyInfo?.state || 'Not provided',
    zip: data?.zip || shopData?.companyInfo?.zip || 'Not provided',
    phone: data?.phone || shopData?.companyInfo?.phone || 'Not provided',
    email: data?.email || shopData?.companyInfo?.email || 'Not provided',
    taxId: data?.taxId || shopData?.companyInfo?.taxId || 'Not provided',
    businessType: data?.businessType || shopData?.companyInfo?.businessType || 'Not provided',
    industry: data?.industry || shopData?.companyInfo?.industry || 'Not provided',
    logoUrl: data?.logoUrl || shopData?.companyInfo?.logoUrl || ''
  };

  console.log('Display data:', displayData);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
        <p className="text-gray-600">Review your shop information below</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Shop Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Shop Name</p>
                <p className="font-medium">{displayData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{displayData.address}</p>
                <p className="text-sm text-gray-600">{displayData.city}, {displayData.state} {displayData.zip}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{displayData.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{displayData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Tax ID</p>
                <p className="font-medium">{displayData.taxId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium">{displayData.businessType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="font-medium">{displayData.industry}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrevious}
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="bg-green-600 hover:bg-green-700"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
