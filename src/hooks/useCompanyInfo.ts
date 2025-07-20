
import { useState, useEffect } from 'react';
import { companyService, type CompanyInfo, type BusinessHours } from '@/services/settings/companyService';
import { useBusinessConstants } from '@/hooks/useBusinessConstants';
import { useToast } from '@/hooks/use-toast';
import { cleanPhoneNumber } from '@/utils/formatters';

export function useCompanyInfo() {
  const { toast } = useToast();
  const { businessTypes, businessIndustries, isLoading: isLoadingConstants } = useBusinessConstants();
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    tax_id: '',
    business_type: '',
    industry: '',
    other_industry: '',
    logo_url: ''
  });
  
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [shopId, setShopId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { shopId: loadedShopId, companyInfo: loadedInfo } = await companyService.getShopInfo();
      const loadedHours = await companyService.getBusinessHours(loadedShopId);
      
      setShopId(loadedShopId);
      setCompanyInfo(loadedInfo);
      setBusinessHours(loadedHours);
      setInitialized(true);
    } catch (error) {
      console.error('Failed to load company info:', error);
      const errorMessage = "Failed to load company information";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('company-', '');
    
    setCompanyInfo(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setDataChanged(true);
  };

  const handleSelectChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'industry' && value !== 'other' ? { other_industry: '' } : {})
    }));
    setDataChanged(true);
  };

  const handleBusinessHoursChange = (hours: BusinessHours[]) => {
    setBusinessHours(hours);
    setDataChanged(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shopId) return;

    try {
      setUploadingLogo(true);
      const logoUrl = await companyService.uploadLogo(shopId, file);
      
      setCompanyInfo(prev => ({
        ...prev,
        logo_url: logoUrl
      }));
      setDataChanged(true);

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateResult = await companyService.updateCompanyInfo(shopId, companyInfo);
      
      if (updateResult.success) {
        setCompanyInfo(updateResult.data);
        
        await companyService.updateBusinessHours(shopId, businessHours);
        
        setDataChanged(false);
        setSaveComplete(true);
        
        toast({
          title: "Success",
          description: "Company information saved successfully",
        });
        
        setTimeout(() => setSaveComplete(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save company info:', error);
      toast({
        title: "Error",
        description: "Failed to save company information",
        variant: "destructive",
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
    error,
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    loadCompanyInfo
  };
}
