
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, ChevronRight } from 'lucide-react';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Badge } from "@/components/ui/badge";

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onDeleteCategory: (id: string) => void;
  selectedCategory: ServiceMainCategory | null;
}

const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onSelectCategory,
  onDeleteCategory,
  selectedCategory
}) => {
  // Sort categories by position
  const sortedCategories = [...categories].sort((a, b) => 
    (a.position ?? 0) - (b.position ?? 0)
  );

  // Get total jobs count for a category
  const getTotalJobsCount = (category: ServiceMainCategory) => {
    return category.subcategories.reduce(
      (total, subcategory) => total + subcategory.jobs.length, 
      0
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedCategories.map((category) => {
        const isSelected = selectedCategory?.id === category.id;
        const totalJobs = getTotalJobsCount(category);
        
        return (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-all ${
              isSelected ? "border-esm-blue-500 shadow-md ring-2 ring-esm-blue-200" : "hover:shadow-md"
            }`}
            onClick={() => onSelectCategory(category)}
          >
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-md">{category.name}</h3>
                  <Badge variant="outline" className="bg-esm-blue-50 text-esm-blue-700">
                    {totalJobs} {totalJobs === 1 ? 'service' : 'services'}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-2">
              {/* Show subcategory preview */}
              <div className="space-y-2">
                {category.subcategories.length > 0 ? (
                  <>
                    <div className="text-xs text-muted-foreground mb-1">
                      {category.subcategories.length} {category.subcategories.length === 1 ? 'subcategory' : 'subcategories'}:
                    </div>
                    {category.subcategories.slice(0, 2).map(subcategory => (
                      <div key={subcategory.id} className="text-sm font-medium flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-esm-blue-500" />
                        <span>{subcategory.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({subcategory.jobs.length} {subcategory.jobs.length === 1 ? 'service' : 'services'})
                        </span>
                      </div>
                    ))}
                    {category.subcategories.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{category.subcategories.length - 2} more subcategories
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No subcategories</div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-esm-blue-600 hover:text-esm-blue-800 hover:bg-esm-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(category);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span className="ml-1">Edit</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceCategoryList;
