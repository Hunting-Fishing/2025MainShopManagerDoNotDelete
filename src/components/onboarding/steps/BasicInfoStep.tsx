
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    updateData({ basicInfo: { ...formData, [name]: value } });
  };

  const handleNext = async () => {
    if (!formData.shopName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the shop name and email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Get or create shop
      let shopId;
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (profile?.shop_id) {
        shopId = profile.shop_id;
        // Update existing shop
        const { error: updateError } = await supabase
          .from('shops')
          .update({
            name: formData.shopName,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip: formData.zipCode || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', shopId);

        if (updateError) throw updateError;
      } else {
        // Create new shop
        const { data: newShop, error: shopError } = await supabase
          .from('shops')
          .insert({
            name: formData.shopName,
            email: formData.email,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip: formData.zipCode || null,
            owner_id: user.id,
          })
          .select()
          .single();

        if (shopError) throw shopError;
        shopId = newShop.id;

        // Update profile with shop_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ shop_id: shopId })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Upsert onboarding progress (insert or update)
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          shop_id: shopId,
          current_step: 1,
          completed_steps: ['basic-info'],
          is_completed: false,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'shop_id'
        });

      if (progressError) throw progressError;

      toast({
        title: "Information Saved",
        description: "Your basic shop information has been saved successfully.",
      });

      onNext();
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast({
        title: "Error",
        description: "Failed to save shop information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <FormField
            label="Shop Name"
            id="shopName"
            name="shopName"
            value={formData.shopName}
            onChange={handleInputChange}
            placeholder="Enter your shop name"
            required
          />
        </div>

        <FormField
          label="Owner Name"
          id="ownerName"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleInputChange}
          placeholder="Enter owner name"
        />

        <FormField
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email address"
          required
        />

        <FormField
          label="Phone Number"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Enter phone number"
        />

        <div className="md:col-span-2">
          <FormField
            label="Address"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter street address"
          />
        </div>

        <FormField
          label="City"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="Enter city"
        />

        <FormField
          label="State"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          placeholder="Enter state"
        />

        <FormField
          label="ZIP Code"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          placeholder="Enter ZIP code"
        />
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} disabled>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={loading}>
          {loading ? "Saving..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
