
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, ChevronRight, Check } from 'lucide-react';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Create a default tab value from the first category name or use selected category
  const defaultTab = selectedCategory ? selectedCategory.name : 
    sortedCategories.length > 0 ? sortedCategories[0].name : "";

  return (
    <div className="space-y-6">
      {sortedCategories.length > 0 ? (
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full mb-6 flex flex-wrap h-auto py-2 gap-2 bg-muted">
            {sortedCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.name}
                className="relative px-4 py-2 data-[state=active]:bg-esm-blue-100 data-[state=active]:text-esm-blue-700"
                onClick={() => onSelectCategory(category)}
              >
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <Badge variant="outline" className="bg-esm-blue-50 text-esm-blue-700">
                    {getTotalJobsCount(category)}
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sortedCategories.map((category) => (
            <TabsContent key={category.id} value={category.name} className="mt-6">
              <Card className="border-esm-blue-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {category.name}
                      <Badge variant="outline" className="bg-esm-blue-50 text-esm-blue-700">
                        {getTotalJobsCount(category)} {getTotalJobsCount(category) === 1 ? 'service' : 'services'}
                      </Badge>
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span>Delete</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-esm-blue-600 hover:text-esm-blue-800 hover:bg-esm-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(category);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="bg-gray-50 border rounded-md p-4">
                        <h4 className="font-medium text-sm mb-2 border-b pb-2">{subcategory.name}</h4>
                        <div className="space-y-2">
                          {subcategory.jobs.map(job => (
                            <div key={job.id} className="text-sm flex items-center gap-1">
                              <ChevronRight className="h-3 w-3 text-esm-blue-500" />
                              <span>{job.name}</span>
                            </div>
                          ))}
                          {subcategory.jobs.length === 0 && (
                            <div className="text-xs text-muted-foreground italic">No services in this category</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {category.subcategories.length === 0 && (
                      <div className="text-muted-foreground">No subcategories defined</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center p-6 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No service categories found</p>
          <p className="text-sm mt-2">Try importing categories from an Excel file or create a new one</p>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryList;
