
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { useShopData } from '@/hooks/useShopData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
  onComplete?: () => void;
  loading?: boolean;
}

export function BasicInfoStep({ onNext, onPrevious, data, updateData, loading = false }: StepProps) {
  const { companyInfo, updateCompanyInfo, shopData, refresh } = useShopData();
  const [isSaving, setIsSaving] = useState(false);
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
    setIsSaving(true);
    updateData(formData);
    
    try {
      // Check if shop exists, if not create it
      if (!shopData?.id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Create the shop
          const { data: newShop, error: shopError } = await supabase
            .from('shops')
            .insert({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zip,
              setup_step: 0,
              onboarding_completed: false
            })
            .select()
            .single();
          
          if (shopError) {
            console.error('Failed to create shop:', shopError);
            toast.error('Failed to create shop. Please try again.');
            setIsSaving(false);
            return;
          }
          
          if (newShop) {
            // Link user profile to shop
            await supabase
              .from('profiles')
              .update({ shop_id: newShop.id })
              .eq('user_id', user.id);
            
            // Refresh shop data
            await refresh();
          }
        }
      } else {
        // Shop exists, just update
        await updateCompanyInfo(formData);
      }
      
      onNext();
    } catch (error) {
      console.error('Failed to save shop info:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Shop Name"
          id="company-name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your shop name"
          required
        />
        
        <FormField
          label="Email"
          id="company-email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="your-email@domain.com"
          required
        />
        
        <FormField
          label="Phone"
          id="company-phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="(555) 123-4567"
          required
        />
        
        <FormField
          label="Address"
          id="company-address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="123 Main Street"
          required
        />
        
        <FormField
          label="City"
          id="company-city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Your City"
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="State / Province"
            id="company-state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="State or Province"
            required
          />
          
          <FormField
            label="ZIP / Postal Code"
            id="company-zip"
            value={formData.zip}
            onChange={handleInputChange}
            placeholder="ZIP or Postal Code"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={loading || isSaving}>
          {isSaving ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
