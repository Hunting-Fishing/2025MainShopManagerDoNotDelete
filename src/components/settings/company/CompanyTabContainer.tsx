
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CircleDollarSign, Clock, Save } from "lucide-react";
import { BasicInfoSection } from "./BasicInfoSection";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { BusinessHoursSection } from "./BusinessHoursSection";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { CompanyTabSkeleton } from "./CompanyTabSkeleton";
import { useToast } from "@/hooks/use-toast";

export function CompanyTabContainer() {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  
  const {
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
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    loadCompanyInfo
  } = useCompanyInfo();

  // Debug logs
  useEffect(() => {
    if (initialized && !loading) {
      console.log("Company info in container:", companyInfo);
      console.log("Business hours in container:", businessHours);
    }
  }, [companyInfo, businessHours, initialized, loading]);

  // Only force refresh data when component initially mounts
  useEffect(() => {
    if (!loading && !initialized) {
      loadCompanyInfo();
    }
  }, [loadCompanyInfo, loading, initialized]);

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
            {loading && !initialized ? (
              <CompanyTabSkeleton />
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
                    {saving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
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
