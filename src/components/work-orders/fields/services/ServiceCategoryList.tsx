
import { ServiceCategory } from "@/types/services";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Check, ChevronRight, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to check if the category is a ServiceMainCategory
  const isServiceMainCategory = (category: any): category is ServiceMainCategory => {
    return 'id' in category && 'subcategories' in category;
  };

  // Helper function to extract subcategory names for a specific category
  const getSubcategoryNames = (category: ServiceMainCategory | ServiceCategory): string[] => {
    if (isServiceMainCategory(category)) {
      // For new format, extract job names from subcategories
      const jobNames: string[] = [];
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          jobNames.push(job.name);
        });
      });
      return jobNames;
    } else {
      // For old format, fall back to subcategories if available
      let names: string[] = [];
      (category as ServiceCategory).subcategories?.forEach(sub => {
        names = names.concat(sub.services || []);
      });
      return names;
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getJobsCount = (category: ServiceMainCategory | ServiceCategory): number => {
    if (isServiceMainCategory(category)) {
      return category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0);
    } else {
      return (category as ServiceCategory).subcategories?.reduce(
        (total, sub) => total + (sub.services?.length || 0), 0
      ) || 0;
    }
  };

  const getSubcategoriesCount = (category: ServiceMainCategory | ServiceCategory): number => {
    if (isServiceMainCategory(category)) {
      return category.subcategories.length;
    } else {
      return (category as ServiceCategory).subcategories?.length || 0;
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[280px] border-r pr-1">
      <div className="px-2 mb-3">
        <h4 className="font-medium text-sm mb-2">Service Categories</h4>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-8 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-[450px]">
        <div className="space-y-1 pr-2">
          {filteredCategories.map((category) => {
            // Get category name and job count based on the category type
            const categoryName = category.name;
            const isExpanded = expandedCategories[categoryName] || selectedCategory === categoryName;
            const jobsCount = getJobsCount(category);
            const subcategoriesCount = getSubcategoriesCount(category);
            
            // Generate a unique key based on available properties
            const key = isServiceMainCategory(category) ? (category as ServiceMainCategory).id : categoryName;

            // Get services/jobs for this category
            const services = getSubcategoryNames(category);

            return (
              <div key={key} className="mb-3">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto mr-1"
                    onClick={() => toggleCategory(categoryName)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between font-normal text-sm h-10 px-3",
                      selectedCategory === categoryName
                        ? "bg-esm-blue-50 text-esm-blue-700 hover:bg-esm-blue-100 hover:text-esm-blue-700"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => onCategorySelect(categoryName)}
                  >
                    <div className="flex items-center justify-between w-full text-left">
                      <span className="truncate max-w-[140px] font-semibold">{categoryName}</span>
                      <div className="flex items-center space-x-1">
                        {subcategoriesCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-muted">
                            {subcategoriesCount} {subcategoriesCount === 1 ? 'subcat' : 'subcats'}
                          </Badge>
                        )}
                        {selectedCategory === categoryName && (
                          <Check className="h-4 w-4 text-esm-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Display services when category is expanded */}
                {isExpanded && services.length > 0 && (
                  <div className="pl-7 mt-1 space-y-1">
                    {services.slice(0, 5).map((serviceName, index) => (
                      <div 
                        key={`${serviceName}-${index}`} 
                        className="text-xs py-1 px-2 bg-gray-50 text-gray-700 rounded border-l-2 border-gray-300 truncate max-w-[240px]"
                      >
                        {serviceName}
                      </div>
                    ))}
                    {services.length > 5 && (
                      <div className="text-xs text-muted-foreground pl-2 pt-1">
                        +{services.length - 5} more services
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
