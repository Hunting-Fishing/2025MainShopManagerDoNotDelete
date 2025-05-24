
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useShopId } from '@/hooks/useShopId';
import { toast } from '@/hooks/use-toast';

interface BasicInfoStepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

const businessTypes = [
  'Independent Shop',
  'Franchise',
  'Dealership Service Center',
  'Fleet Service',
  'Mobile Service',
  'Specialty Shop'
];

const industries = [
  'General Automotive Repair',
  'Transmission Service',
  'Brake Service',
  'Tire Service',
  'Body Shop',
  'Performance/Racing',
  'Classic Car Restoration',
  'Truck/Heavy Vehicle',
  'Motorcycle Service',
  'Marine Service',
  'Equipment Repair'
];

export function BasicInfoStep({ onNext, onPrevious, data, updateData }: BasicInfoStepProps) {
  const { shopId } = useShopId();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    businessType: '',
    industry: '',
    ...data.basicInfo
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (name, email, phone)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save to shops table
      if (shopId) {
        const { error: shopError } = await supabase
          .from('shops')
          .update({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zip,
            phone: formData.phone,
            email: formData.email,
            business_type: formData.businessType,
            industry: formData.industry,
            updated_at: new Date().toISOString()
          })
          .eq('id', shopId);

        if (shopError) throw shopError;

        // Save to onboarding progress
        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert({
            shop_id: shopId,
            step_data: {
              basicInfo: formData,
              businessSettings: data.businessSettings || {},
              sampleData: data.sampleData || {}
            },
            current_step: 1,
            completed_steps: [0]
          });

        if (progressError) throw progressError;
      }

      // Update local state
      updateData({ basicInfo: formData });
      onNext();
    } catch (error: any) {
      console.error('Error saving basic info:', error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>
            Tell us about your automotive shop to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your shop name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="State"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="shop@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrevious} variant="outline" disabled>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
