
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
import { Package, Calculator, BarChart3, Receipt, FileText, Settings } from 'lucide-react';

const MEASUREMENT_UNITS = ['Each', 'Box', 'Case', 'Pack', 'Set', 'Kit', 'Gallon', 'Quart', 'Liter', 'Pound', 'Ounce', 'Kilogram', 'Gram', 'Foot', 'Inch', 'Meter', 'Yard'];

export function InventoryForm({
  item,
  onSubmit,
  onCancel,
  isLoading
}: InventoryFormProps) {
  const [values, setValues] = useState<Partial<InventoryItemExtended>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (item) {
      setValues(item);
    }
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-esm-blue-600 to-esm-blue-700">
          <h1 className="text-2xl font-bold text-white mb-2">
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h1>
          <p className="text-esm-blue-100">
            {item ? 'Update item information and pricing details' : 'Create a new inventory item with complete details'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1 rounded-lg h-auto">
              <TabsTrigger 
                value="basic" 
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-esm-blue-600 rounded-md transition-all"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pricing" 
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-esm-blue-600 rounded-md transition-all"
              >
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-esm-blue-600 rounded-md transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Inventory</span>
              </TabsTrigger>
              <TabsTrigger 
                value="taxes" 
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-esm-blue-600 rounded-md transition-all"
              >
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Taxes & Fees</span>
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-esm-blue-600 rounded-md transition-all"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="additional" 
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-esm-blue-600 rounded-md transition-all"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Additional</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="basic" className="space-y-6">
                <div className="animate-fade-in">
                  <BasicInfoSection values={values} errors={errors} onChange={handleChange} />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <div className="animate-fade-in">
                  <PricingSection values={values} errors={errors} onChange={handleChange} />
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6">
                <div className="animate-fade-in">
                  <InventoryManagementSection values={values} errors={errors} onChange={handleChange} measurementUnits={MEASUREMENT_UNITS} />
                </div>
              </TabsContent>

              <TabsContent value="taxes" className="space-y-6">
                <div className="animate-fade-in">
                  <TaxAndFeesSection values={values} errors={errors} onChange={handleChange} />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="animate-fade-in">
                  <ProductDetailsSection values={values} errors={errors} onChange={handleChange} />
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-6">
                <div className="animate-fade-in">
                  <AdditionalInfoSection values={values} errors={errors} onChange={handleChange} />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              * Required fields must be completed
            </div>
            <div className="flex gap-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="px-6 py-2 border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-2 bg-esm-blue-600 hover:bg-esm-blue-700 text-white font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-l-transparent"></div>
                    Saving...
                  </div>
                ) : (
                  item ? 'Update Item' : 'Create Item'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
