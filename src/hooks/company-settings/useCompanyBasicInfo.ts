
import { useState, useCallback } from 'react';
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
      const { shopId, companyInfo: info } = await companyService.getShopInfo();
      console.log("Loaded company info from service:", info);
      setCompanyInfo({
        ...info,
        otherIndustry: info.otherIndustry || ""
      });
      return shopId;
    } catch (error: any) {
      console.error("Failed to load company information:", error);
      toast({
        title: "Error",
        description: "Failed to load company information",
        variant: "destructive"
      });
    } finally {
      if (showLoadingState) setLoading(false);
    }
  }, [toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, shopId: string) => {
    if (!e.target.files || !e.target.files[0] || !shopId) return;
    
    try {
      setUploadingLogo(true);
      const file = e.target.files[0];
      const logoUrl = await companyService.uploadLogo(shopId, file);
      
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

  return {
    companyInfo,
    setCompanyInfo,
    loading,
    uploadingLogo,
    loadCompanyInfo,
    handleFileUpload
  };
}
