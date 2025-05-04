
import React from "react";
import { ServiceMainCategory, CategoryColorStyle } from "@/types/serviceHierarchy";
import { ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCategoriesListProps {
  categories: ServiceMainCategory[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null; 
  onCategorySelect: (id: string) => void;
  onSubcategorySelect: (id: string) => void;
  onJobSelect: (id: string) => void;
  isLoading?: boolean;
  categoryStyles?: Record<string, CategoryColorStyle>;
}

export function ServiceCategoriesList({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedJobId,
  onCategorySelect,
  onSubcategorySelect,
  onJobSelect,
  isLoading = false,
  categoryStyles = {},
}: ServiceCategoriesListProps) {
  // Default style if none matches
  const defaultStyle = {
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
  };

  // Get style for a category
  const getCategoryStyle = (categoryName: string) => {
    const lowerCaseName = categoryName.toLowerCase();
    
    for (const key in categoryStyles) {
      if (key === categoryName || (lowerCaseName.includes(key.toLowerCase()))) {
        return categoryStyles[key];
      }
    }
    
    return categoryStyles["custom"] || defaultStyle;
  };

  // Loading state
  if (isLoading) {
    return <div className="animate-pulse space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded"></div>
      ))}
    </div>;
  }

  // No categories
  if (categories.length === 0) {
    return <div className="text-center p-4 text-slate-500">
      No service categories found
    </div>;
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const style = getCategoryStyle(category.name);
        
        return (
          <div key={category.id} className="space-y-1">
            <div
              className={cn(
                "flex justify-between items-center p-2 rounded-md cursor-pointer",
                isSelected ? style.bg : "hover:bg-slate-50"
              )}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className={cn("font-medium", isSelected ? style.text : "")}>
                {category.name}
              </div>
              {isSelected ? (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : null}
            </div>
            
            {/* Display subcategories if this category is selected */}
            {isSelected && category.subcategories && category.subcategories.length > 0 && (
              <div className="ml-4 border-l border-slate-200 pl-2 space-y-1">
                {category.subcategories.map((subcategory) => {
                  const isSubcategorySelected = selectedSubcategoryId === subcategory.id;
                  
                  return (
                    <div key={subcategory.id} className="space-y-1">
                      <div
                        className={cn(
                          "flex justify-between items-center p-1.5 rounded-md cursor-pointer",
                          isSubcategorySelected ? "bg-slate-100" : "hover:bg-slate-50"
                        )}
                        onClick={() => onSubcategorySelect(subcategory.id)}
                      >
                        <div className={cn("text-sm", isSubcategorySelected ? "font-medium" : "")}>
                          {subcategory.name}
                        </div>
                        {isSubcategorySelected ? (
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        ) : null}
                      </div>
                      
                      {/* Display jobs if this subcategory is selected */}
                      {isSubcategorySelected && subcategory.jobs && subcategory.jobs.length > 0 && (
                        <div className="ml-3 border-l border-slate-200 pl-2 space-y-0.5">
                          {subcategory.jobs.map((job) => (
                            <div
                              key={job.id}
                              className={cn(
                                "flex items-center gap-1 p-1 text-xs rounded cursor-pointer",
                                selectedJobId === job.id
                                  ? "bg-slate-200 font-medium"
                                  : "hover:bg-slate-50"
                              )}
                              onClick={() => onJobSelect(job.id)}
                            >
                              <Wrench className="h-3 w-3 text-slate-400" />
                              {job.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
