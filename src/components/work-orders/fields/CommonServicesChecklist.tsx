
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { serviceCategories } from "@/data/commonServices";

interface CommonServicesChecklistProps {
  onServiceChecked: (checkedServices: string[]) => void;
}

export const CommonServicesChecklist: React.FC<CommonServicesChecklistProps> = ({ 
  onServiceChecked 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({});
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  
  const handleCheckboxChange = (service: string, checked: boolean) => {
    const updatedServices = { ...checkedServices, [service]: checked };
    setCheckedServices(updatedServices);
    
    const selectedServices = Object.entries(updatedServices)
      .filter(([_, isChecked]) => isChecked)
      .map(([serviceName]) => serviceName);
    
    onServiceChecked(selectedServices);
  };

  // Count total checked services
  const checkedCount = Object.values(checkedServices).filter(Boolean).length;

  return (
    <Card>
      <CardHeader 
        className="pb-3 cursor-pointer flex flex-row justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <CardTitle className="text-lg flex items-center">
            Common Services
            {checkedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-2 py-1">
                {checkedCount} selected
              </span>
            )}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Select common services for this work order
          </p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Categories */}
            <div className="space-y-2 border-r pr-4">
              <h4 className="font-medium text-sm text-blue-800 border-b pb-1 mb-2">
                Categories
              </h4>
              {serviceCategories.map((category) => (
                <div
                  key={category.name}
                  className={`cursor-pointer p-2 rounded-lg transition-colors ${
                    selectedMainCategory === category.name
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedMainCategory(category.name)}
                >
                  {category.name}
                </div>
              ))}
            </div>

            {/* Subcategories and Services */}
            <div className="col-span-3">
              {selectedMainCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {serviceCategories
                    .find((cat) => cat.name === selectedMainCategory)
                    ?.subcategories.map((subcategory) => (
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
                                  handleCheckboxChange(service, checked === true)
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
              )}
            </div>
          </div>
          
          {checkedCount > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setCheckedServices({});
                  onServiceChecked([]);
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
