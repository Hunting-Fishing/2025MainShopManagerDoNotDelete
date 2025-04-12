
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/settings/companyService";
import { CompanyInfo } from "@/services/settings/companyService";
import { useBusinessConstants } from "@/hooks/useBusinessConstants";

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
  
  const { toast } = useToast();
  const { 
    businessTypes, 
    businessIndustries, 
    isLoading: isLoadingConstants, 
    fetchBusinessConstants
  } = useBusinessConstants();

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  async function loadCompanyInfo() {
    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error("Failed to load company information:", error);
      toast({
        title: "Error",
        description: "Failed to load company information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [id.replace("company-", "")]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'industry' && value !== 'other' ? { otherIndustry: '' } : {})
    }));
  };

  const handleBusinessHoursChange = (index: number, field: string, value: any) => {
    const newHours = [...businessHours];
    newHours[index][field as keyof typeof newHours[0]] = value;
    setBusinessHours(newHours);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !shopId) return;
    
    try {
      setUploadingLogo(true);
      const file = e.target.files[0];
      
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
      
      try {
        // Update company info and business hours separately
        await companyService.updateCompanyInfo(shopId, dataToSave);
        
        if (businessHours && businessHours.length > 0) {
          await companyService.updateBusinessHours(shopId, businessHours);
        }
        
        toast({
          title: "Success",
          description: "Company information saved successfully",
          variant: "success"
        });
        
        // Reload data to ensure we have the latest info
        await loadCompanyInfo();
      } catch (error: any) {
        console.error("Failed to save company information:", error);
        toast({
          title: "Error",
          description: `Failed to save company information: ${error.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message || 'Unknown error'}`,
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
    shopId,
    uploadingLogo,
    businessTypes,
    businessIndustries,
    isLoadingConstants,
    initialized,
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    loadCompanyInfo
  };
}
