
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ServiceCategory } from "@/types/services";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceMainCategory } from "@/types/serviceHierarchy";

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
  // Helper function to check if the category is a ServiceMainCategory
  const isServiceMainCategory = (category: any): category is ServiceMainCategory => {
    return 'id' in category;
  };

  // Determine the subcategories based on the type
  const subcategories = category.subcategories || [];

  return (
    <ScrollArea className="h-[450px] flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 px-2">
        {subcategories.map((subcategory) => {
          // Get the services array based on type
          const services = isServiceMainCategory(category)
            ? (subcategory as any).jobs?.map((job: any) => job.name) || []
            : (subcategory as any).services || [];
            
          const subcategoryName = (subcategory as any).name || "";

          return (
            <Card key={isServiceMainCategory(category) ? (subcategory as any).id : subcategoryName} className="border border-muted bg-card/50">
              <CardHeader className="pb-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {subcategoryName}
                </h4>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services.map((service: string) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        checked={checkedServices[service] || false}
                        onCheckedChange={(checked) =>
                          onServiceCheck(service, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`service-${service}`}
                        className="text-sm cursor-pointer hover:text-foreground"
                      >
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
