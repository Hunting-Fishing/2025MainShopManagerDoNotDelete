
import { ServiceCategory } from "@/types/services";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Check } from "lucide-react";

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
              : category.subcategories?.length;
            
            // Generate a unique key based on available properties
            const key = isServiceMainCategory(category) ? category.id : categoryName;

            return (
              <Button
                key={key}
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal text-sm h-10",
                  selectedCategory === categoryName
                    ? "bg-esm-blue-50 text-esm-blue-700 hover:bg-esm-blue-100 hover:text-esm-blue-700"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onCategorySelect(categoryName)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{categoryName}</span>
                  {subcategoriesCount && (
                    <span className="text-xs text-muted-foreground">
                      {subcategoriesCount} subcategories
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
