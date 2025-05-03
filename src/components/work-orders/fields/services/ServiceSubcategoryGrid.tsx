
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ServiceCategory } from "@/types/services";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ServiceSubcategoryGridProps {
  category: ServiceCategory | ServiceMainCategory;
  checkedServices: Record<string, boolean>;
  onServiceCheck: (service: string, checked: boolean) => void;
}

export const ServiceSubcategoryGrid: React.FC<ServiceSubcategoryGridProps> = ({
  category,
  checkedServices,
  onServiceCheck,
}) => {
  // Keep track of expanded subcategories
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  
  // Helper function to check if the category is a ServiceMainCategory
  const isServiceMainCategory = (category: any): category is ServiceMainCategory => {
    return 'id' in category;
  };

  // Determine the subcategories based on the type
  const subcategories = category.subcategories || [];
  
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Log the structure to see what we're working with
  console.log("Category structure:", category);

  return (
    <ScrollArea className="h-[450px] flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 px-2">
        {subcategories.map((subcategory, subIndex) => {
          const subcategoryName = isServiceMainCategory(category) 
            ? (subcategory as any).name 
            : (subcategory as any).name || "";
            
          const subcategoryId = isServiceMainCategory(category) 
            ? (subcategory as any).id 
            : `${subcategoryName}-${subIndex}`;
            
          const isExpanded = expandedSubcategories[subcategoryId] !== false; // Default to expanded
          
          // Get jobs based on the data structure
          const jobs = isServiceMainCategory(category)
            ? (subcategory as any).jobs || []
            : (subcategory as any).services || [];

          console.log(`Subcategory: ${subcategoryName}, Jobs:`, jobs);

          return (
            <Card key={subcategoryId} className="border border-muted bg-card/50 shadow-sm overflow-hidden">
              <CardHeader className="p-3 border-b bg-esm-blue-50/70 flex flex-row items-center justify-between">
                <h4 className="font-medium text-sm text-esm-blue-700 truncate max-w-[90%]">
                  {subcategoryName}
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => toggleSubcategory(subcategoryId)}
                >
                  {isExpanded ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-3 pt-2">
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {isServiceMainCategory(category) ? (
                      jobs.map((job) => (
                        <div key={job.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${job.id}`}
                            checked={checkedServices[job.name] || false}
                            onCheckedChange={(checked) =>
                              onServiceCheck(job.name, checked === true)
                            }
                          />
                          <Label
                            htmlFor={`service-${job.id}`}
                            className="text-sm cursor-pointer hover:text-foreground truncate max-w-[90%]"
                          >
                            {job.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      // Fallback for old format (if still needed)
                      (subcategory as any).services?.map((service: string, idx: number) => (
                        <div key={`${service}-${idx}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service}-${idx}`}
                            checked={checkedServices[service] || false}
                            onCheckedChange={(checked) =>
                              onServiceCheck(service, checked === true)
                            }
                          />
                          <Label
                            htmlFor={`service-${service}-${idx}`}
                            className="text-sm cursor-pointer hover:text-foreground truncate max-w-[90%]"
                          >
                            {service}
                          </Label>
                        </div>
                      ))
                    )}
                    
                    {/* Display message if no jobs/services are available */}
                    {jobs.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No services available</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
