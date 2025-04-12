import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useBusinessConstants } from "@/hooks/useBusinessConstants";
import { Building, CircleDollarSign, Clock } from "lucide-react";
import { companyService } from "@/services/settings/companyService";
import { BasicInfoSection } from "./BasicInfoSection";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { BusinessHoursSection } from "./BusinessHoursSection";
import { CompanyInfo } from "@/services/settings/companyService";

export function CompanyTabContainer() {
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
  const [activeTab, setActiveTab] = useState("basic");
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const { toast } = useToast();
  const { businessTypes, businessIndustries, isLoading: isLoadingConstants, fetchBusinessConstants } = useBusinessConstants();

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  async function loadCompanyInfo() {
    try {
      setLoading(true);
      
      // Get company info
      const { shopId: id, companyInfo: info } = await companyService.getShopInfo();
      setShopId(id);
      
      // Make sure otherIndustry has a default value if it's undefined
      setCompanyInfo({
        ...info,
        otherIndustry: info.otherIndustry || ""
      });
      
      // Get business hours
      if (id) {
        const hours = await companyService.getBusinessHours(id);
        setBusinessHours(hours);
      }
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
      
      // Handle custom industry if needed
      if (companyInfo.industry === "other" && companyInfo.otherIndustry) {
        try {
          // Add the custom industry to the database and get its ID
          const industryId = await companyService.addCustomIndustry(companyInfo.otherIndustry);
          
          if (industryId) {
            console.log("Added custom industry with ID:", industryId);
            // Refresh the business constants to include the new industry
            await fetchBusinessConstants();
            // Note: We'll keep the UI as "other" for this save, next time they load
            // the form it will show their custom industry in the dropdown
          }
        } catch (error) {
          console.error("Error adding custom industry:", error);
          // Continue with saving other data
        }
      }
      
      // Prepare data for saving - ensure otherIndustry is only set when industry is "other"
      const dataToSave = {
        ...companyInfo,
        otherIndustry: companyInfo.industry === "other" ? companyInfo.otherIndustry : ""
      };
      
      await companyService.updateCompanyInfo(shopId, dataToSave, businessHours);
      
      toast({
        title: "Success",
        description: "Company information saved successfully",
        variant: "success"
      });
    } catch (error) {
      console.error("Failed to save company information:", error);
      toast({
        title: "Error",
        description: "Failed to save company information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            <span>Business Details</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Business Hours</span>
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <TabsContent value="basic" className="mt-0">
                  <BasicInfoSection
                    companyInfo={companyInfo}
                    uploadingLogo={uploadingLogo}
                    onInputChange={handleInputChange}
                    onFileUpload={handleFileUpload}
                  />
                </TabsContent>

                <TabsContent value="business" className="mt-0">
                  <BusinessInfoSection
                    companyInfo={companyInfo}
                    businessTypes={businessTypes}
                    businessIndustries={businessIndustries}
                    isLoadingConstants={isLoadingConstants}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                  />
                </TabsContent>

                <TabsContent value="hours" className="mt-0">
                  <BusinessHoursSection
                    businessHours={businessHours}
                    onBusinessHoursChange={handleBusinessHoursChange}
                  />
                </TabsContent>

                <div className="flex justify-end mt-6">
                  <Button 
                    className="bg-esm-blue-600 hover:bg-esm-blue-700"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
