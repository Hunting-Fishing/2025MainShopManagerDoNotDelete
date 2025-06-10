
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryFormProps } from './InventoryFormProps';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PricingSection } from './sections/PricingSection';
import { InventoryManagementSection } from './sections/InventoryManagementSection';
import { TaxAndFeesSection } from './sections/TaxAndFeesSection';
import { ProductDetailsSection } from './sections/ProductDetailsSection';
import { AdditionalInfoSection } from './sections/AdditionalInfoSection';
import { Button } from '@/components/ui/button';
import { InventoryItemExtended } from '@/types/inventory';

export function InventoryForm({ item, onSubmit, onCancel, isLoading }: InventoryFormProps) {
  const [values, setValues] = useState<Partial<InventoryItemExtended>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (item) {
      setValues(item);
    }
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!values.name?.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (values.price && values.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    if (values.quantity && values.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="taxes">Taxes & Fees</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="basic">
            <BasicInfoSection 
              values={values} 
              errors={errors} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingSection 
              values={values} 
              errors={errors} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagementSection 
              values={values} 
              errors={errors} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="taxes">
            <TaxAndFeesSection 
              values={values} 
              errors={errors} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="details">
            <ProductDetailsSection 
              values={values} 
              errors={errors} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="additional">
            <AdditionalInfoSection 
              values={values} 
              errors={errors} 
              onChange={handleChange} 
            />
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
