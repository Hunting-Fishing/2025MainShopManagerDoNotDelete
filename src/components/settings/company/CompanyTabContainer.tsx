import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanySettings } from '@/hooks/company-settings/useCompanySettings';
import { BusinessInfoSection } from './BusinessInfoSection';
import { Card } from '@/components/ui/card';

interface CompanyTabContainerProps {
  // Add props if needed
}

export function CompanyTabContainer({}: CompanyTabContainerProps) {
  const [activeTab, setActiveTab] = useState('business-info');
  
  const {
    companyInfo,
    businessHours,
    saving,
    uploadingLogo,
    businessTypes,
    businessIndustries,
    isLoadingConstants,
    initialized,
    saveComplete,
    dataChanged,
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    initialize
  } = useCompanySettings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Company Settings</h1>
        
        <div className="flex items-center gap-2">
          {dataChanged && (
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="business-info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="business-info">Business Info</TabsTrigger>
          <TabsTrigger value="business-hours">Hours</TabsTrigger>
          <TabsTrigger value="payment-options">Payment Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business-info" className="mt-6">
          <BusinessInfoSection 
            companyInfo={companyInfo}
            businessTypes={businessTypes}
            businessIndustries={businessIndustries}
            isLoadingConstants={isLoadingConstants}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        </TabsContent>
        
        <TabsContent value="business-hours" className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Business Hours</h2>
            {/* Business hours form would go here */}
            <p className="text-muted-foreground">Configure your shop's operating hours</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment-options" className="mt-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Payment Options</h2>
            {/* Payment options form would go here */}
            <p className="text-muted-foreground">Configure accepted payment methods</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
