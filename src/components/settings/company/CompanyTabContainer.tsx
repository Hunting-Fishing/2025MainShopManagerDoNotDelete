
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CircleDollarSign, Clock, Save } from "lucide-react";
import { BasicInfoSection } from "./BasicInfoSection";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { BusinessHoursSection } from "./BusinessHoursSection";
import { useCompanySettings } from "@/hooks/company-settings/useCompanySettings";
import { CompanyTabSkeleton } from "./CompanyTabSkeleton";
import { useToast } from "@/hooks/use-toast";
import { CompanyInfo } from "@/services/settings/companyService.types";

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
    dataChanged,
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    initialize
  } = useCompanySettings();

  // Initialize data when component mounts
  useEffect(() => {
    console.log("CompanyTabContainer: Initializing data");
    initialize();
  }, [initialize]);

  // Debug logs to track the state
  useEffect(() => {
    if (initialized) {
      console.log("Company info in container:", companyInfo);
      console.log("Company info has keys:", Object.keys(companyInfo));
      console.log("Company info name:", companyInfo.name);
      console.log("Business hours in container:", businessHours);
      console.log("Data changed status:", dataChanged);
      console.log("Loading status:", loading);
    }
  }, [companyInfo, businessHours, initialized, loading, dataChanged]);

  // Check if company data appears to be empty (all fields are empty strings or null/undefined)
  const isCompanyInfoEmpty = !companyInfo || Object.values(companyInfo).every(
    val => val === "" || val === null || val === undefined
  );

  // Extra debug to check emptiness
  useEffect(() => {
    if (initialized) {
      console.log("Is company info empty:", isCompanyInfoEmpty);
      // Check each field individually
      Object.entries(companyInfo).forEach(([key, value]) => {
        console.log(`Field ${key} = ${value} (empty? ${!value})`);
      });
    }
  }, [companyInfo, initialized, isCompanyInfoEmpty]);

  // Prompt user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dataChanged) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    if (dataChanged) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [dataChanged]);

  // When tab changes - log it to help with debugging
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);

  // Reload data when save operation completes
  useEffect(() => {
    if (saveComplete) {
      toast({
        title: "Success",
        description: "Company information saved successfully",
        variant: "success"
      });
    }
  }, [saveComplete, toast]);

  const handleReloadData = () => {
    console.log("Manually reloading company data");
    initialize();
    toast({
      title: "Information",
      description: "Reloading company data from server",
      variant: "default"
    });
  };

  const handleSaveClick = async () => {
    try {
      console.log("Save button clicked, current data changed status:", dataChanged);
      await handleSave();
    } catch (error) {
      console.error("Error caught in CompanyTabContainer:", error);
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Company Information</CardTitle>
            {initialized && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReloadData}
                disabled={loading || saving}
              >
                Refresh Data
              </Button>
            )}
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
                    companyInfo={companyInfo}  // This now matches the CompanyInfo type
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

                <div className="flex justify-between mt-6">
                  {isCompanyInfoEmpty && initialized && !loading && (
                    <div className="text-amber-600 text-sm">
                      No company information found. Please fill in the form and save.
                    </div>
                  )}
                  <div className="ml-auto">
                    <Button 
                      className={`${dataChanged ? 'bg-esm-blue-600 hover:bg-esm-blue-700' : 'bg-gray-300 hover:bg-gray-400'}`}
                      onClick={handleSaveClick}
                      disabled={saving || !dataChanged}
                    >
                      {saving ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {dataChanged ? "Save Changes" : "No Changes"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
