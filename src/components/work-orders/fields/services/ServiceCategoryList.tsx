
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
    return 'id' in category && 'subcategories' in category;
  };

  // Helper function to extract subcategory names for a specific category
  const getSubcategoryNames = (category: ServiceMainCategory | ServiceCategory): string[] => {
    if (isServiceMainCategory(category)) {
      // For new format, extract subcategory names directly
      return category.subcategories.map(sub => sub.name);
    } else {
      // For old format, fall back to subcategories if available
      return (category as ServiceCategory).subcategories?.map(sub => sub.name) || [];
    }
  };

  return (
    <div className="w-[280px] border-r pr-1">
      <h4 className="font-medium text-sm mb-3 px-2">Service Categories</h4>
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

            // Get subcategory names for this category
            const subcategoryNames = getSubcategoryNames(category);

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
                    <span className="truncate max-w-[180px] font-semibold">{categoryName}</span>
                    <div className="flex items-center space-x-1">
                      {subcategoriesCount > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 whitespace-nowrap">
                          {subcategoriesCount} {subcategoriesCount === 1 ? 'service' : 'services'}
                        </span>
                      )}
                      {selectedCategory === categoryName ? (
                        <Check className="h-4 w-4 text-esm-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </Button>

                {/* Display subcategory previews if this is the selected category */}
                {selectedCategory === categoryName && subcategoryNames.length > 0 && (
                  <div className="pl-3 mt-1 space-y-1">
                    {subcategoryNames.slice(0, 3).map((subcategoryName, index) => (
                      <div 
                        key={`${subcategoryName}-${index}`} 
                        className="text-xs font-medium py-1 px-2 bg-esm-blue-50 text-esm-blue-700 rounded border-l-2 border-esm-blue-500 truncate max-w-[240px]"
                      >
                        {subcategoryName}
                      </div>
                    ))}
                    {subcategoryNames.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-2">
                        +{subcategoryNames.length - 3} more
                      </div>
                    )}
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
