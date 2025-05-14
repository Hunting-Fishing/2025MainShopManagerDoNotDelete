
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, LayersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCategoryList } from "./services/ServiceCategoryList";
import { ServiceSubcategoryGrid } from "./services/ServiceSubcategoryGrid";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/serviceHierarchy";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

interface CommonServicesChecklistProps {
  onServiceChecked: (checkedServices: string[]) => void;
}

export const CommonServicesChecklist: React.FC<CommonServicesChecklistProps> = ({
  onServiceChecked,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("categories");
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch service categories from Developer Portal on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const fetchedCategories = await fetchServiceCategories();
        setCategories(fetchedCategories);
        // Set the first category as selected if available and none is selected
        if (fetchedCategories.length > 0 && !selectedMainCategory) {
          setSelectedMainCategory(fetchedCategories[0].name);
        }
      } catch (error) {
        console.error("Error loading service categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [selectedMainCategory]);

  const handleCheckboxChange = (service: string, checked: boolean) => {
    const updatedServices = { ...checkedServices, [service]: checked };
    setCheckedServices(updatedServices);
    
    const selectedServices = Object.entries(updatedServices)
      .filter(([_, isChecked]) => isChecked)
      .map(([serviceName]) => serviceName);
    
    onServiceChecked(selectedServices);
  };

  const checkedCount = Object.values(checkedServices).filter(Boolean).length;
  // Find the selected category object
  const selectedCategory = categories.find(cat => cat.name === selectedMainCategory);

  const renderCategoriesContent = () => {
    if (isLoading) {
      return (
        <div className="flex gap-6 min-h-[500px] bg-muted/5 rounded-lg p-4">
          <div className="w-[280px] border-r pr-1">
            <h4 className="font-medium text-sm mb-3 px-2">Categories</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground min-h-[200px] flex flex-col items-center justify-center">
          <p>No service categories found in Developer Portal.</p>
          <p className="text-sm mt-1">Visit the Service Management page to create service categories.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = '/developer/service-management'}
          >
            Go to Service Management
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-6 min-h-[500px] bg-muted/5 rounded-lg p-4">
        <ServiceCategoryList
          categories={categories.map(cat => cat.name)}
          selectedCategory={selectedMainCategory}
          onCategorySelect={setSelectedMainCategory}
        />
        {selectedCategory && selectedMainCategory && (
          <ServiceSubcategoryGrid
            category={selectedMainCategory}
            subcategories={selectedCategory.subcategories.map(sub => sub.name)}
            selectedSubcategory={null}
            onSelectSubcategory={() => {}}
          />
        )}
      </div>
    );
  };

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
              Select services from Developer Portal for this work order
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
              {renderCategoriesContent()}
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
