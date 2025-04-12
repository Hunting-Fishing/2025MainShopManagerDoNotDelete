
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CircleDollarSign, Clock } from "lucide-react";
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
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    loadCompanyInfo
  } = useCompanyInfo();

  // Debugging - check if we have data
  if (initialized && !loading) {
    console.log("Company info in container:", companyInfo);
    console.log("Business hours in container:", businessHours);
  }

  const onSaveChanges = async () => {
    await handleSave();
    // Explicit reload after save to ensure fields are updated
    await loadCompanyInfo();
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
                    onClick={onSaveChanges}
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
