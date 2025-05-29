
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Building2, MapPin, Phone, Mail, FileText, Briefcase, Globe } from 'lucide-react';
import { useShopData } from '@/hooks/useShopData';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

export function CompletionStep({ onNext, onPrevious, data, updateData }: StepProps) {
  const { shopData, companyInfo, loading } = useShopData();
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching your shop information...</p>
        </div>
      </div>
    );
  }

  // Combine onboarding form data with existing shop data, prioritizing form data
  const displayData = {
    name: data?.name || companyInfo?.name || shopData?.name || 'Not provided',
    address: data?.address || companyInfo?.address || shopData?.address || 'Not provided',
    city: data?.city || companyInfo?.city || shopData?.city || 'Not provided',
    state: data?.state || companyInfo?.state || shopData?.state || 'Not provided',
    zip: data?.zip || companyInfo?.zip || shopData?.postal_code || 'Not provided',
    phone: data?.phone || companyInfo?.phone || shopData?.phone || 'Not provided',
    email: data?.email || companyInfo?.email || shopData?.email || 'Not provided',
    taxId: data?.taxId || companyInfo?.tax_id || shopData?.tax_id || 'Not provided',
    businessType: data?.businessType || companyInfo?.business_type || shopData?.business_type || 'Not provided',
    industry: data?.industry || companyInfo?.industry || shopData?.industry || 'Not provided',
    logoUrl: data?.logoUrl || companyInfo?.logo_url || shopData?.logo_url || ''
  };

  console.log('CompletionStep - Form data:', data);
  console.log('CompletionStep - Company info:', companyInfo);
  console.log('CompletionStep - Shop data:', shopData);
  console.log('CompletionStep - Display data:', displayData);

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
