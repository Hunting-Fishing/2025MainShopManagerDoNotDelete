
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InventoryFormProps } from './InventoryFormProps';
import { InventoryItemExtended, MEASUREMENT_UNITS } from '@/types/inventory';
import { useInventoryFormValidation } from '@/hooks/inventory/useInventoryFormValidation';
import { useInventoryForm } from './useInventoryForm';

// Import form sections
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PricingSection } from './sections/PricingSection';
import { InventoryManagementSection } from './sections/InventoryManagementSection';
import { TaxAndFeesSection } from './sections/TaxAndFeesSection';
import { ProductDetailsSection } from './sections/ProductDetailsSection';
import { AdditionalInfoSection } from './sections/AdditionalInfoSection';

export function InventoryForm({ item, onSubmit, onCancel, isLoading }: InventoryFormProps) {
  const { values, setValues, errors, setErrors, getInventoryStatus } = useInventoryForm();
  const { formErrors, validateForm, clearError } = useInventoryFormValidation();
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form with item data or defaults
  useEffect(() => {
    if (item) {
      setValues(item);
    } else {
      // Set default values for new item
      setValues({
        name: '',
        sku: '',
        category: '',
        supplier: '',
        unit_price: 0,
        price: 0,
        quantity: 0,
        reorder_point: 0,
        status: 'active',
        unitOfMeasurement: 'each',
        measurementType: 'count',
        gstApplicable: true,
        gstRate: 5,
        pstApplicable: false,
        hstApplicable: false,
        coreChargeApplicable: false,
        hazardousFeeApplicable: false,
      });
    }
  }, [item, setValues]);

  const handleInputChange = (field: string, value: any) => {
    setValues(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate status based on quantity and reorder point
      if (field === 'quantity' || field === 'reorder_point') {
        updated.status = getInventoryStatus(updated);
      }
      
      // Auto-sync price fields
      if (field === 'unit_price') {
        updated.price = value;
      } else if (field === 'price') {
        updated.unit_price = value;
      }
      
      return updated;
    });
    
    // Clear field error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      clearError(field);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(values as Omit<InventoryItemExtended, 'id'>)) {
      return;
    }

    try {
      await onSubmit(values as Omit<InventoryItemExtended, 'id'>);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const tabItems = [
    { value: 'basic', label: 'Basic Info', icon: '📋' },
    { value: 'pricing', label: 'Pricing', icon: '💰' },
    { value: 'inventory', label: 'Inventory', icon: '📦' },
    { value: 'taxes', label: 'Taxes & Fees', icon: '🧾' },
    { value: 'details', label: 'Product Details', icon: '📄' },
    { value: 'additional', label: 'Additional', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {item ? `Edit ${item.name}` : 'Add New Inventory Item'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {tabItems.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-6">
                <TabsContent value="basic">
                  <BasicInfoSection
                    values={values}
                    errors={formErrors}
                    onChange={handleInputChange}
                  />
                </TabsContent>

                <TabsContent value="pricing">
                  <PricingSection
                    values={values}
                    errors={formErrors}
                    onChange={handleInputChange}
                  />
                </TabsContent>

                <TabsContent value="inventory">
                  <InventoryManagementSection
                    values={values}
                    errors={formErrors}
                    onChange={handleInputChange}
                    measurementUnits={MEASUREMENT_UNITS}
                  />
                </TabsContent>

                <TabsContent value="taxes">
                  <TaxAndFeesSection
                    values={values}
                    errors={formErrors}
                    onChange={handleInputChange}
                  />
                </TabsContent>

                <TabsContent value="details">
                  <ProductDetailsSection
                    values={values}
                    errors={formErrors}
                    onChange={handleInputChange}
                  />
                </TabsContent>

                <TabsContent value="additional">
                  <AdditionalInfoSection
                    values={values}
                    errors={formErrors}
                    onChange={handleInputChange}
                  />
                </TabsContent>
              </div>
            </Tabs>

            <Separator />

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Status: <strong>{values.status || 'Not Set'}</strong>
              </div>
              
              <div className="flex gap-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
