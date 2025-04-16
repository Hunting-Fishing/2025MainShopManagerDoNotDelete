
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
    } catch (error) {
      console.error("Failed to initialize company settings:", error);
    }
  }, [loadCompanyInfo, loadBusinessHours]);

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
    if (!shopId) return;
    
    try {
      setSaving(true);
      setSaveComplete(false);
      
      const result = await companyService.updateCompanyInfo(shopId, companyInfo);
      console.log("Company info save result:", result);
      
      if (result && result.data) {
        setCompanyInfo(result.data);
      }
      
      if (businessHours && businessHours.length > 0) {
        const updatedHours = await companyService.updateBusinessHours(shopId, businessHours);
        if (updatedHours) {
          setBusinessHours(updatedHours);
        }
      }
      
      toast({
        title: "Success",
        description: "Company information saved successfully",
        variant: "success"
      });
      
      setDataChanged(false);
      setSaveComplete(true);
      
    } catch (error: any) {
      console.error("Failed to save company information:", error);
      toast({
        title: "Error",
        description: `Failed to save company information: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
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
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => 
      handleFileUpload(e, shopId || ''),
    handleSave,
    initialize
  };
}
