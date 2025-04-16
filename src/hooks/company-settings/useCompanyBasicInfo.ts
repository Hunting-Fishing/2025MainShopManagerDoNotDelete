
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/settings/companyService';
import { CompanyInfo } from '@/services/settings/companyService';

export function useCompanyBasicInfo() {
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { toast } = useToast();

  const loadCompanyInfo = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      
      console.log("Loading company info...");
      const { shopId, companyInfo: info } = await companyService.getShopInfo();
      
      console.log("Loaded company info from service:", info);
      
      if (!info) {
        console.error("No company info returned from service");
        toast({
          title: "Warning",
          description: "Could not load company information",
          variant: "destructive"
        });
        return null;
      }
      
      // Make sure we're correctly setting the loaded data
      setCompanyInfo({
        name: info.name || "",
        address: info.address || "",
        city: info.city || "",
        state: info.state || "",
        zip: info.zip || "",
        phone: info.phone || "",
        email: info.email || "",
        taxId: info.taxId || "",
        businessType: info.businessType || "",
        industry: info.industry || "",
        otherIndustry: info.otherIndustry || "",
        logoUrl: info.logoUrl || ""
      });
      
      return shopId;
    } catch (error: any) {
      console.error("Failed to load company information:", error);
      toast({
        title: "Error",
        description: "Failed to load company information: " + (error?.message || "Unknown error"),
        variant: "destructive"
      });
      return null;
    } finally {
      if (showLoadingState) setLoading(false);
    }
  }, [toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, shopId: string) => {
    if (!e.target.files || !e.target.files[0] || !shopId) return;
    
    try {
      setUploadingLogo(true);
      const file = e.target.files[0];
      console.log("Uploading file:", file.name, "for shopId:", shopId);
      
      const logoUrl = await companyService.uploadLogo(shopId, file);
      console.log("Logo upload response:", logoUrl);
      
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
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo: " + (error?.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Add debug effect to monitor state
  useEffect(() => {
    console.log("Current company info state in hook:", companyInfo);
  }, [companyInfo]);

  return {
    companyInfo,
    setCompanyInfo,
    loading,
    uploadingLogo,
    loadCompanyInfo,
    handleFileUpload
  };
}
