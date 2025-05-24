
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BasicInfoStepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

export function BasicInfoStep({ onNext, onPrevious, data, updateData }: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    shopName: data.basicInfo?.shopName || '',
    ownerName: data.basicInfo?.ownerName || '',
    email: data.basicInfo?.email || '',
    phone: data.basicInfo?.phone || '',
    address: data.basicInfo?.address || '',
    city: data.basicInfo?.city || '',
    state: data.basicInfo?.state || '',
    zipCode: data.basicInfo?.zipCode || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update the parent data immediately
    updateData({
      basicInfo: newFormData
    });
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData);
    
    if (!formData.shopName?.trim()) {
      toast.error('Shop name is required');
      return false;
    }
    
    if (!formData.ownerName?.trim()) {
      toast.error('Owner name is required');
      return false;
    }
    
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!formData.phone?.trim()) {
      toast.error('Phone is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  const saveToDatabase = async () => {
    try {
      console.log('Starting database save operation');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        throw new Error('No user found');
      }

      console.log('User found:', user.id);

      // Get user's shop
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) {
        console.error('No shop found for user');
        throw new Error('No shop found for user');
      }

      console.log('Shop found:', profile.shop_id);

      // Update shop with basic info
      const { error: shopError } = await supabase
        .from('shops')
        .update({
          name: formData.shopName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.shop_id);

      if (shopError) {
        console.error('Shop update error:', shopError);
        throw shopError;
      }

      console.log('Shop updated successfully');

      // Update onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          shop_id: profile.shop_id,
          current_step: 1,
          completed_steps: [0],
          step_data: { basicInfo: formData },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'shop_id'
        });

      if (progressError) {
        console.error('Progress update error:', progressError);
        throw progressError;
      }

      console.log('Onboarding progress updated successfully');
      toast.success('Basic information saved successfully!');
      
    } catch (error) {
      console.error('Database save error:', error);
      toast.error('Failed to save basic information. You can continue to the next step and try again later.');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    
    // First validate the form
    if (!validateForm()) {
      console.log('Form validation failed, not proceeding');
      return;
    }

    setIsSubmitting(true);

    try {
      // Navigate to next step immediately after validation
      console.log('Form validation passed, navigating to next step');
      onNext();
      
      // Save to database in the background
      console.log('Saving to database in background');
      await saveToDatabase();
      
    } catch (error) {
      console.error('Error during form submission:', error);
      // Even if database save fails, we already navigated to next step
      // This prevents users from getting stuck on this step
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextClick = () => {
    console.log('Next button clicked, triggering form submit');
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="shopName">Shop Name *</Label>
          <Input
            id="shopName"
            value={formData.shopName}
            onChange={(e) => handleInputChange('shopName', e.target.value)}
            placeholder="Enter your shop name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ownerName">Owner Name *</Label>
          <Input
            id="ownerName"
            value={formData.ownerName}
            onChange={(e) => handleInputChange('ownerName', e.target.value)}
            placeholder="Enter owner's full name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="shop@example.com"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Street address"
          />
        </div>
        
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
          />
        </div>
        
        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="State or Province"
          />
        </div>
        
        <div>
          <Label htmlFor="zipCode">Postal Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="12345"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={true}
        >
          Previous
        </Button>
        
        <Button 
          type="button"
          onClick={handleNextClick}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </form>
  );
}
