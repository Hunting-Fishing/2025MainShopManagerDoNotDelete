
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ServiceCategory } from "@/types/services";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceSubcategoryGridProps {
  category: ServiceCategory;
  checkedServices: Record<string, boolean>;
  onServiceCheck: (service: string, checked: boolean) => void;
}

export const ServiceSubcategoryGrid: React.FC<ServiceSubcategoryGridProps> = ({
  category,
  checkedServices,
  onServiceCheck,
}) => {
  return (
    <ScrollArea className="h-[500px] flex-1 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        {category.subcategories.map((subcategory) => (
          <Card key={subcategory.name}>
            <CardHeader className="pb-2">
              <h4 className="font-medium text-sm">{subcategory.name}</h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subcategory.services.map((service) => (
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
                      className="text-sm cursor-pointer"
                    >
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
