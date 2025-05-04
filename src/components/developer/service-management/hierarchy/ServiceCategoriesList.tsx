
import React from "react";
import { ServiceMainCategory, CategoryColorStyle, ServiceSubcategory } from "@/types/serviceHierarchy";
import { ChevronRight, Wrench, Grip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
    
    // Predefined color styles for common categories
    const builtInStyles: Record<string, CategoryColorStyle> = {
      "engine": { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
      "brake": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
      "transmission": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
      "electrical": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
      "suspension": { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
      "tire": { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
      "body": { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
      "interior": { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
      "ac": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
      "maintenance": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    };
    
    // First check user-defined styles
    for (const key in categoryStyles) {
      if (key === categoryName || lowerCaseName.includes(key.toLowerCase())) {
        return categoryStyles[key];
      }
    }
    
    // Then check built-in styles
    for (const key in builtInStyles) {
      if (lowerCaseName.includes(key)) {
        return builtInStyles[key];
      }
    }
    
    return categoryStyles["custom"] || defaultStyle;
  };

  // Count jobs in a subcategory
  const getJobCount = (subcategory: ServiceSubcategory): number => {
    return subcategory.jobs?.length || 0;
  };

  // Loading state with better skeleton UI
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-10 bg-slate-100 rounded-md"></div>
            {i < 2 && (
              <div className="ml-4 space-y-2">
                <div className="h-8 bg-slate-50 rounded-md w-5/6"></div>
                <div className="h-8 bg-slate-50 rounded-md w-4/6"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // No categories
  if (categories.length === 0) {
    return (
      <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <div className="text-slate-500 mb-1">No service categories found</div>
        <div className="text-xs text-slate-400">Add categories to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const style = getCategoryStyle(category.name);
        const subcategoryCount = category.subcategories?.length || 0;
        
        return (
          <div key={category.id} className="space-y-1.5">
            <div
              className={cn(
                "flex justify-between items-center p-2.5 rounded-md cursor-pointer group transition-all",
                isSelected 
                  ? `${style.bg} ${style.border} border shadow-sm` 
                  : "hover:bg-slate-50 border border-transparent"
              )}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex items-center gap-2.5">
                <Grip className="h-4 w-4 text-slate-400 invisible group-hover:visible" />
                <div className={cn("font-medium", isSelected ? style.text : "")}>
                  {category.name}
                </div>
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {subcategoryCount} {subcategoryCount === 1 ? 'subcategory' : 'subcategories'}
                </Badge>
              </div>
              {isSelected ? (
                <ChevronRight className={`h-4 w-4 ${style.text}`} />
              ) : null}
            </div>
            
            {/* Display subcategories if this category is selected */}
            {isSelected && category.subcategories && category.subcategories.length > 0 && (
              <div className="ml-5 border-l border-slate-200 pl-3 space-y-1.5">
                {category.subcategories.map((subcategory) => {
                  const isSubcategorySelected = selectedSubcategoryId === subcategory.id;
                  const jobCount = getJobCount(subcategory);
                  
                  return (
                    <div key={subcategory.id} className="space-y-1.5">
                      <div
                        className={cn(
                          "flex justify-between items-center p-2 rounded-md cursor-pointer transition-all",
                          isSubcategorySelected 
                            ? "bg-slate-100 shadow-sm" 
                            : "hover:bg-slate-50"
                        )}
                        onClick={() => onSubcategorySelect(subcategory.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("text-sm", isSubcategorySelected ? "font-medium" : "")}>
                            {subcategory.name}
                          </div>
                          {jobCount > 0 && (
                            <Badge variant="outline" className="text-xs py-0 h-5">
                              {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                            </Badge>
                          )}
                        </div>
                        {isSubcategorySelected ? (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        ) : null}
                      </div>
                      
                      {/* Display jobs if this subcategory is selected */}
                      {isSubcategorySelected && subcategory.jobs && subcategory.jobs.length > 0 && (
                        <div className="ml-4 border-l border-slate-200 pl-3 space-y-1">
                          {subcategory.jobs.map((job) => (
                            <div
                              key={job.id}
                              className={cn(
                                "flex items-center gap-2 p-2 text-sm rounded cursor-pointer transition-colors",
                                selectedJobId === job.id
                                  ? "bg-slate-200 font-medium"
                                  : "hover:bg-slate-50"
                              )}
                              onClick={() => onJobSelect(job.id)}
                            >
                              <Wrench className="h-3.5 w-3.5 text-slate-500" />
                              <div className="flex-1">{job.name}</div>
                              {job.price && (
                                <div className="text-xs text-slate-500 font-mono">
                                  ${job.price.toFixed(2)}
                                </div>
                              )}
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
