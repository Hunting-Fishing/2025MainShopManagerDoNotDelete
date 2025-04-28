
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, LayersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serviceCategories } from "@/data/commonServices";
import { ServiceCategoryList } from "./services/ServiceCategoryList";
import { ServiceSubcategoryGrid } from "./services/ServiceSubcategoryGrid";

interface CommonServicesChecklistProps {
  onServiceChecked: (checkedServices: string[]) => void;
}

export const CommonServicesChecklist: React.FC<CommonServicesChecklistProps> = ({
  onServiceChecked,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("categories");
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(
    serviceCategories[0]?.name || null
  );

  const handleCheckboxChange = (service: string, checked: boolean) => {
    const updatedServices = { ...checkedServices, [service]: checked };
    setCheckedServices(updatedServices);
    
    const selectedServices = Object.entries(updatedServices)
      .filter(([_, isChecked]) => isChecked)
      .map(([serviceName]) => serviceName);
    
    onServiceChecked(selectedServices);
  };

  const checkedCount = Object.values(checkedServices).filter(Boolean).length;
  const selectedCategory = serviceCategories.find(cat => cat.name === selectedMainCategory);

  return (
    <Card className="mb-6 border-esm-blue-100 shadow-md">
      <CardHeader 
        className="pb-3 cursor-pointer flex flex-row justify-between items-center bg-gradient-to-r from-esm-blue-50/50 to-transparent"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <LayersIcon className="h-5 w-5 text-esm-blue-600" />
          <div>
            <CardTitle className="text-lg flex items-center">
              Common Services
              {checkedCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-esm-blue-100 text-esm-blue-700 text-xs font-medium rounded-full px-2.5 py-1">
                  {checkedCount} selected
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select common services for this work order
            </p>
          </div>
        </div>
        {expanded ? 
          <ChevronUp className="h-5 w-5 text-muted-foreground" /> : 
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        }
      </CardHeader>

      {expanded && (
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 bg-muted/30">
              <TabsTrigger value="categories" className="data-[state=active]:bg-white">Categories</TabsTrigger>
              <TabsTrigger value="transmission" className="data-[state=active]:bg-white">Transmission</TabsTrigger>
              <TabsTrigger value="trans-axle" className="data-[state=active]:bg-white">Trans-Axle</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="m-0">
              <div className="flex gap-6 min-h-[500px] bg-muted/5 rounded-lg p-4">
                <ServiceCategoryList
                  categories={serviceCategories}
                  selectedCategory={selectedMainCategory}
                  onCategorySelect={setSelectedMainCategory}
                />
                {selectedCategory && (
                  <ServiceSubcategoryGrid
                    category={selectedCategory}
                    checkedServices={checkedServices}
                    onServiceCheck={handleCheckboxChange}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="transmission">
              <div className="p-4 text-center text-muted-foreground">
                Transmission services coming soon
              </div>
            </TabsContent>

            <TabsContent value="trans-axle">
              <div className="p-4 text-center text-muted-foreground">
                Trans-axle services coming soon
              </div>
            </TabsContent>
          </Tabs>

          {checkedCount > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setCheckedServices({});
                  onServiceChecked([]);
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
