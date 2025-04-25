
import { useState, useEffect } from 'react';
import { useBusinessConstants } from '@/hooks/useBusinessConstants';

export const useCompanySettings = () => {
  const {
    businessTypeOptions,
    industryOptions, 
    paymentMethodOptions,
    loading,
    error
  } = useBusinessConstants();

  // Company settings state
  const [companyInfo, setCompanyInfo] = useState<any>({});
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);

  // Map properties for backward compatibility
  const businessTypes = businessTypeOptions;
  const businessIndustries = industryOptions;
  const isLoadingConstants = loading;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
    setDataChanged(true);
  };

  const handleSelectChange = (name: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
    setDataChanged(true);
  };

  const handleBusinessHoursChange = (updatedHours: any[]) => {
    setBusinessHours(updatedHours);
    setDataChanged(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we'd upload the file to a server
      const logoUrl = URL.createObjectURL(file);
      setCompanyInfo(prev => ({ ...prev, logoUrl }));
      setDataChanged(true);
    } catch (error) {
      console.error("Error uploading logo:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving to server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveComplete(true);
      setDataChanged(false);
      
      setTimeout(() => {
        setSaveComplete(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving company settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const initialize = async () => {
    try {
      // Simulate fetching company data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCompanyInfo({
        companyName: "Auto Shop Pro",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        phone: "555-123-4567",
        email: "contact@autoshoppro.com",
        website: "https://autoshoppro.com",
        businessType: "llc",
        industry: "automotive",
      });
      
      setBusinessHours([
        { day: "monday", open: "09:00", close: "18:00", closed: false },
        { day: "tuesday", open: "09:00", close: "18:00", closed: false },
        { day: "wednesday", open: "09:00", close: "18:00", closed: false },
        { day: "thursday", open: "09:00", close: "18:00", closed: false },
        { day: "friday", open: "09:00", close: "18:00", closed: false },
        { day: "saturday", open: "10:00", close: "16:00", closed: false },
        { day: "sunday", open: "00:00", close: "00:00", closed: true },
      ]);
      
      setInitialized(true);
    } catch (error) {
      console.error("Error initializing company settings:", error);
    }
  };

  useEffect(() => {
    if (!initialized && !loading) {
      initialize();
    }
  }, [initialized, loading]);

  return {
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
    initialize,
    // Original returned properties
    businessTypeOptions,
    industryOptions,
    paymentMethodOptions,
    loading,
    error
  };
};
