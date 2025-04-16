
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyBasicInfo } from './useCompanyBasicInfo';
import { useBusinessHours } from './useBusinessHours';
import { companyService } from '@/services/settings/companyService';
import { useBusinessConstants } from '@/hooks/useBusinessConstants';

export function useCompanySettings() {
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { businessTypes, businessIndustries, isLoading: isLoadingConstants } = useBusinessConstants();
  
  const {
    companyInfo,
    setCompanyInfo,
    loading,
    uploadingLogo,
    loadCompanyInfo,
    handleFileUpload
  } = useCompanyBasicInfo();

  const {
    businessHours,
    setBusinessHours,
    loadBusinessHours,
    handleBusinessHoursChange
  } = useBusinessHours();

  const initialize = useCallback(async () => {
    try {
      const id = await loadCompanyInfo();
      if (id) {
        setShopId(id);
        await loadBusinessHours(id);
      }
      setInitialized(true);
      setDataChanged(false); // Reset data changed flag after successful initialization
    } catch (error) {
      console.error("Failed to initialize company settings:", error);
      toast({
        title: "Error",
        description: "Failed to load company settings",
        variant: "destructive"
      });
    }
  }, [loadCompanyInfo, loadBusinessHours, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace("company-", "");
    
    setCompanyInfo(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    setDataChanged(true);
  };

  const handleSelectChange = (field: string, value: string) => {
    console.log("Select changed:", field, value);
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'industry' && value !== 'other' ? { otherIndustry: '' } : {})
    }));
    setDataChanged(true);
  };

  const handleSave = async () => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "No shop ID available, cannot save",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      setSaveComplete(false);
      
      console.log("Saving company info:", companyInfo);
      const result = await companyService.updateCompanyInfo(shopId, companyInfo);
      console.log("Company info save result:", result);
      
      if (result && result.data) {
        setCompanyInfo(result.data);
      } else {
        console.warn("No data returned from updateCompanyInfo");
      }
      
      if (businessHours && businessHours.length > 0) {
        console.log("Updating business hours for shop", shopId, "with data:", businessHours);
        const updatedHours = await companyService.updateBusinessHours(shopId, businessHours);
        if (updatedHours) {
          setBusinessHours(updatedHours);
          console.log("Business hours updated successfully");
        } else {
          console.warn("No data returned from updateBusinessHours");
        }
      }
      
      setDataChanged(false);
      setSaveComplete(true);
      
    } catch (error: any) {
      console.error("Failed to save company information:", error);
      toast({
        title: "Error",
        description: `Failed to save company information: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
      throw error; // Re-throw to allow the UI component to handle it
    } finally {
      setSaving(false);
    }
  };

  return {
    companyInfo,
    businessHours,
    loading,
    saving,
    uploadingLogo,
    businessTypes,
    businessIndustries,
    isLoadingConstants,
    initialized,
    saveComplete,
    dataChanged,
    shopId,
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileUpload(e, shopId || '').then(() => {
        setDataChanged(true); // Mark as changed when logo is uploaded
      });
    },
    handleSave,
    initialize
  };
}
