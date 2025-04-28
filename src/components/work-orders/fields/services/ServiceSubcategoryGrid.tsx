
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ServiceCategory } from "@/types/services";

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
    <div className="col-span-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {category.subcategories.map((subcategory) => (
          <div key={subcategory.name} className="space-y-2">
            <h4 className="font-medium text-sm text-blue-800 border-b pb-1 mb-2">
              {subcategory.name}
            </h4>
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
          </div>
        ))}
      </div>
    </div>
  );
};
