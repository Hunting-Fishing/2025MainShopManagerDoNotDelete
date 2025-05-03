
import { ServiceCategory } from "@/types/services";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Check, ChevronRight } from "lucide-react";

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[] | ServiceCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  // Helper function to check if the category is a ServiceMainCategory
  const isServiceMainCategory = (category: any): category is ServiceMainCategory => {
    return 'id' in category;
  };

  // Helper function to extract sub-job headers for specific categories
  // These would be displayed as headers above the job groupings
  const getSubJobHeaders = (categoryName: string): string[] => {
    // Define sub-job headers by category
    if (categoryName === "Adjustments & Diagnosis") {
      return [
        "Adjustments", 
        "CAR SYMPTOMS-ENGINE PERFORMANCE", 
        "CHECK OUTS", 
        "COMMENTS W/O PRICES", 
        "DIAGNOSTIC CHARGES", 
        "MILEAGE SERVICES", 
        "NOISES - COMFORTS", 
        "ROAD SERVICES & TOWING", 
        "STARTING - LIGHTS", 
        "VIBRATIONS - LEAKS"
      ];
    }
    // Add more categories as needed
    return [];
  };

  return (
    <div className="w-[280px] border-r pr-1">
      <h4 className="font-medium text-sm mb-3 px-2">Categories</h4>
      <ScrollArea className="h-[450px]">
        <div className="space-y-1 pr-2">
          {categories.map((category) => {
            // Get category name and subcategory count based on the category type
            const categoryName = category.name;
            const subcategoriesCount = isServiceMainCategory(category) 
              ? category.subcategories?.length 
              : (category as ServiceCategory).subcategories?.length;
            
            // Generate a unique key based on available properties
            const key = isServiceMainCategory(category) ? (category as ServiceMainCategory).id : categoryName;

            // Get sub-job headers for this category if they exist
            const subJobHeaders = getSubJobHeaders(categoryName);

            return (
              <div key={key} className="mb-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between font-normal text-sm h-10 px-3",
                    selectedCategory === categoryName
                      ? "bg-esm-blue-50 text-esm-blue-700 hover:bg-esm-blue-100 hover:text-esm-blue-700 font-medium"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => onCategorySelect(categoryName)}
                >
                  <div className="flex items-center justify-between w-full text-left">
                    <span>{categoryName}</span>
                    <div className="flex items-center space-x-1">
                      {subcategoriesCount > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                          {subcategoriesCount} {subcategoriesCount === 1 ? 'subcategory' : 'subcategories'}
                        </span>
                      )}
                      {selectedCategory === categoryName ? (
                        <Check className="h-4 w-4 text-esm-blue-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </div>
                </Button>

                {/* Display sub-job headers if this is the selected category and it has sub-job headers */}
                {selectedCategory === categoryName && subJobHeaders.length > 0 && (
                  <div className="pl-3 mt-1 space-y-1">
                    {subJobHeaders.map((header) => (
                      <div 
                        key={header} 
                        className="text-xs font-medium py-1 px-2 bg-esm-blue-50 text-esm-blue-700 rounded border-l-2 border-esm-blue-500"
                      >
                        {header}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
