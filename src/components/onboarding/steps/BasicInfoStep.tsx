
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { useShopData } from '@/hooks/useShopData';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
  onComplete?: () => void;
  loading?: boolean; // Add loading property
}

export function BasicInfoStep({ onNext, onPrevious, data, updateData, loading = false }: StepProps) {
  const { companyInfo, updateCompanyInfo } = useShopData();
  const [formData, setFormData] = useState({
    name: data.name || companyInfo?.name || '',
    email: data.email || companyInfo?.email || '',
    phone: data.phone || companyInfo?.phone || '',
    address: data.address || companyInfo?.address || '',
    city: data.city || companyInfo?.city || '',
    state: data.state || companyInfo?.state || '',
    zip: data.zip || companyInfo?.zip || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('company-', '');
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleNext = async () => {
    updateData(formData);
    
    // Save to database
    await updateCompanyInfo(formData);
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Shop Name"
          id="company-name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        
        <FormField
          label="Email"
          id="company-email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        
        <FormField
          label="Phone"
          id="company-phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        
        <FormField
          label="Address"
          id="company-address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
        
        <FormField
          label="City"
          id="company-city"
          value={formData.city}
          onChange={handleInputChange}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="State"
            id="company-state"
            value={formData.state}
            onChange={handleInputChange}
            required
          />
          
          <FormField
            label="ZIP Code"
            id="company-zip"
            value={formData.zip}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={loading}>
          {loading ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
