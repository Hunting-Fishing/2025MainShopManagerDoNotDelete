
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/settings/companyService";
import { CompanyInfo } from "@/services/settings/companyService";
import { useBusinessConstants } from "@/hooks/useBusinessConstants";
import { cleanPhoneNumber } from "@/utils/formatters";

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    taxId: "",
    businessType: "",
    industry: "",
    otherIndustry: "", 
    logoUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  
  const { toast } = useToast();
  const { 
    businessTypes, 
    businessIndustries, 
    isLoading: isLoadingConstants, 
    fetchBusinessConstants
  } = useBusinessConstants();

  // Function to load company info - made into a callback so we can call it after saving
  const loadCompanyInfo = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      
      // Get company info
      const { shopId: id, companyInfo: info } = await companyService.getShopInfo();
      setShopId(id);
      
      console.log("Loaded company info:", info);
      
      // Make sure otherIndustry has a default value if it's undefined
      setCompanyInfo({
        ...info,
        otherIndustry: info.otherIndustry || ""
      });
      
      // Get business hours
      if (id) {
        const hours = await companyService.getBusinessHours(id);
        console.log("Loaded business hours:", hours);
        setBusinessHours(hours || []);
      }

      setInitialized(true);
      setDataChanged(false);
    } catch (error) {
      console.error("Failed to load company information:", error);
      toast({
        title: "Error",
        description: "Failed to load company information",
        variant: "destructive"
      });
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [toast]);

  // Initial data loading - this now runs only once when the component mounts
  useEffect(() => {
    loadCompanyInfo();
  }, [loadCompanyInfo]);
  
  // Create a separate effect to reload data when returning to this tab
  useEffect(() => {
    // Create a visibility change listener to reload data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && initialized) {
        // Only reload if we've been initialized before
        loadCompanyInfo(false); // Don't show loading state for this refresh
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadCompanyInfo, initialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log("Input changed:", id, value);
    
    // Extract the field name without the "company-" prefix
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

  const handleBusinessHoursChange = (index: number, field: string, value: any) => {
    console.log("Business hours changed:", index, field, value);
    const newHours = [...businessHours];
    newHours[index][field] = value;
    setBusinessHours(newHours);
    setDataChanged(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !shopId) return;
    
    try {
      setUploadingLogo(true);
      const file = e.target.files[0];
      console.log("Uploading file:", file.name, file.size, file.type);
      
      const logoUrl = await companyService.uploadLogo(shopId, file);
      console.log("Logo uploaded successfully:", logoUrl);
      
      if (logoUrl) {
        setCompanyInfo(prev => ({
          ...prev,
          logoUrl
        }));
        
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
          variant: "success"
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!shopId) return;
    
    try {
      setSaving(true);
      setSaveComplete(false);
      console.log("Saving company info:", companyInfo);
      
      // Handle custom industry if needed
      if (companyInfo.industry === "other" && companyInfo.otherIndustry) {
        try {
          // Add the custom industry to the database and get its ID
          const industryId = await companyService.addCustomIndustry(companyInfo.otherIndustry);
          
          if (industryId) {
            console.log("Added custom industry with ID:", industryId);
            // Refresh the business constants to include the new industry
            await fetchBusinessConstants();
          }
        } catch (error: any) {
          console.error("Error adding custom industry:", error);
          toast({
            title: "Warning",
            description: `Failed to add custom industry: ${error.message || 'Unknown error'}`,
            variant: "destructive"
          });
        }
      }
      
      // Prepare data for saving - ensure otherIndustry is only set when industry is "other"
      const dataToSave = {
        ...companyInfo,
        otherIndustry: companyInfo.industry === "other" ? companyInfo.otherIndustry : ""
      };
      
      // Log data before saving to ensure it's correct
      console.log("Data being saved:", dataToSave);
      
      try {
        // Update company info
        const result = await companyService.updateCompanyInfo(shopId, dataToSave);
        console.log("Company info save result:", result);
        
        // Update the local state with the returned data
        if (result && result.data) {
          setCompanyInfo(result.data);
        }
        
        // Update business hours if they've been changed
        if (businessHours && businessHours.length > 0) {
          const updatedHours = await companyService.updateBusinessHours(shopId, businessHours);
          console.log("Business hours saved:", updatedHours);
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
        
        // Refresh data from server to ensure we have the latest state
        await loadCompanyInfo(false);
      } catch (error: any) {
        console.error("Failed to save company information:", error);
        toast({
          title: "Error",
          description: `Failed to save company information: ${error.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Add a console.log to debug the company info and logo
  useEffect(() => {
    if (initialized && !loading) {
      console.log("Current company info state:", companyInfo);
    }
  }, [companyInfo, initialized, loading]);

  return {
    companyInfo,
    businessHours,
    loading,
    saving,
    shopId,
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
    loadCompanyInfo
  };
}
