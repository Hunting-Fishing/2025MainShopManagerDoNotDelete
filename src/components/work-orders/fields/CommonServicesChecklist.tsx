import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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
    <Card>
      <CardHeader 
        className="pb-3 cursor-pointer flex flex-row justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <CardTitle className="text-lg flex items-center">
            Common Services
            {checkedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-2 py-1">
                {checkedCount} selected
              </span>
            )}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Select common services for this work order
          </p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </CardHeader>

      {expanded && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transmission">Transmission</TabsTrigger>
              <TabsTrigger value="trans-axle">Trans-Axle</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="m-0">
              <div className="flex gap-4">
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
              <div className="space-y-4">
                <h3 className="font-medium">Transmission Services</h3>
                {/* Add transmission-specific services here */}
              </div>
            </TabsContent>

            <TabsContent value="trans-axle">
              <div className="space-y-4">
                <h3 className="font-medium">Trans-Axle Services</h3>
                {/* Add trans-axle specific services here */}
              </div>
            </TabsContent>
          </Tabs>

          {checkedCount > 0 && (
            <div className="flex justify-end mt-4">
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
