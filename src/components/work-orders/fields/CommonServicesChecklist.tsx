
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface CommonServicesChecklistProps {
  onServiceChecked: (checkedServices: string[]) => void;
}

export const CommonServicesChecklist: React.FC<CommonServicesChecklistProps> = ({ 
  onServiceChecked 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({});
  
  // Common automotive services organized by category
  const serviceCategories = [
    {
      name: "Oil & Fluids",
      services: [
        "Oil Change", 
        "Oil Filter Replacement", 
        "Transmission Fluid Service",
        "Brake Fluid Flush",
        "Power Steering Fluid",
        "Coolant Flush"
      ]
    },
    {
      name: "Maintenance",
      services: [
        "Air Filter Replacement", 
        "Fuel Filter Replacement",
        "Cabin Air Filter",
        "Engine Tune-up",
        "Belt Inspection/Replacement",
        "Battery Test/Replacement"
      ]
    },
    {
      name: "Brakes",
      services: [
        "Brake Pad Replacement", 
        "Brake Rotor Resurfacing",
        "Brake Rotor Replacement",
        "Brake Caliper Service",
        "Brake Line Inspection",
        "ABS System Inspection"
      ]
    },
    {
      name: "Tires",
      services: [
        "Tire Rotation", 
        "Tire Balancing",
        "Wheel Alignment",
        "Tire Replacement",
        "TPMS Service",
        "Flat Repair"
      ]
    }
  ];

  const handleCheckboxChange = (service: string, checked: boolean) => {
    const updatedServices = { ...checkedServices, [service]: checked };
    setCheckedServices(updatedServices);
    
    // Create array of checked service names
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
              <span className="ml-2 inline-flex items-center justify-center bg-esm-blue-100 text-esm-blue-700 text-xs font-medium rounded-full px-2 py-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {serviceCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <h4 className="font-medium text-sm text-esm-blue-800 border-b pb-1 mb-2">
                  {category.name}
                </h4>
                <div className="space-y-2">
                  {category.services.map((service) => (
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
