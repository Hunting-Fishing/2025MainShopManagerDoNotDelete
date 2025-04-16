
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanyBasicInfo } from './useCompanyBasicInfo';
import { useBusinessHours } from './useBusinessHours';
import { companyService } from '@/services/settings/companyService';
import { useBusinessConstants } from '@/hooks/useBusinessConstants';
import { handleApiError } from '@/utils/errorHandling';

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
    loading: loadingInfo,
    uploadingLogo,
    loadCompanyInfo,
    handleFileUpload
  } = useCompanyBasicInfo();

  const {
    businessHours,
    setBusinessHours,
    loadBusinessHours,
    handleBusinessHoursChange,
    isLoading: loadingHours
  } = useBusinessHours();

  // Debugging on mount
  useEffect(() => {
    console.log("useCompanySettings mounted");
  }, []);

  const initialize = useCallback(async () => {
    console.log("Initializing company settings...");
    try {
      // First load company info
      const id = await loadCompanyInfo();
      console.log("Company info loaded, shop ID:", id);
      
      if (id) {
        setShopId(id);
        // Then load business hours
        const hours = await loadBusinessHours(id);
        console.log("Business hours loaded:", hours?.length || 0, "records");
      } else {
        console.warn("No shop ID returned from loadCompanyInfo");
        toast({
          title: "Warning",
          description: "Could not load shop information",
          variant: "destructive"
        });
      }
      
      setInitialized(true);
      setDataChanged(false); // Reset data changed flag after successful initialization
      console.log("Company settings initialization complete");
    } catch (error) {
      console.error("Failed to initialize company settings:", error);
      handleApiError(error, "Failed to load company settings");
    }
  }, [loadCompanyInfo, loadBusinessHours, toast]);

  // Ensure initialization happens when the hook mounts
  useEffect(() => {
    if (!initialized && !shopId) {
      initialize();
    }
  }, [initialize, initialized, shopId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, name } = e.target;
    // Try to extract field name from id (company-name -> name) or use the name attribute directly
    const fieldName = name || id.replace("company-", "");
    
    console.log(`Input changed: ${fieldName} = ${value}`);
    
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
      
      toast({
        title: "Success",
        description: "Company information saved successfully",
        variant: "success"
      });
      
      // Refresh data from the server to ensure we have latest state
      await initialize();
      
    } catch (error: any) {
      console.error("Failed to save company information:", error);
      handleApiError(error, "Failed to save company information");
    } finally {
      setSaving(false);
    }
  };

  // Add a debug effect to monitor state changes
  useEffect(() => {
    if (initialized) {
      console.log("Company info state updated:", companyInfo);
      console.log("Business hours state updated:", businessHours);
      console.log("Data changed status:", dataChanged);
    }
  }, [companyInfo, businessHours, initialized, dataChanged]);

  return {
    companyInfo,
    businessHours,
    loading: loadingInfo || loadingHours,
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
      if (shopId) {
        handleFileUpload(e, shopId).then(() => {
          setDataChanged(true); // Mark as changed when logo is uploaded
        });
      } else {
        console.error("Cannot upload logo - no shop ID available");
        toast({
          title: "Error",
          description: "Cannot upload logo - shop information not loaded",
          variant: "destructive"
        });
      }
    },
    handleSave,
    initialize
  };
}
