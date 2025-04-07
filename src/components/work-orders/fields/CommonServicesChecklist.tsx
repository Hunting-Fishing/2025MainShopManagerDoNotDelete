
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChecklistItem {
  id: string;
  label: string;
}

const maintenanceItems: ChecklistItem[] = [
  { id: "oil-change", label: "Oil Change" },
  { id: "oil-filter", label: "Replace Oil Filter" },
  { id: "air-filter", label: "Clean Air Filter" },
  { id: "rotate-tires", label: "Rotate Tires" },
  { id: "brake-check", label: "Adjust Brakes" },
  { id: "brake-pads", label: "Replace Brake Pads" },
  { id: "wheel-alignment", label: "Wheel Alignment" },
  { id: "repack-wheel-bearings", label: "Repack Front Wheels" },
  { id: "transmission-fluid", label: "Transmission Fluid" },
  { id: "diff-fluid", label: "Differential Fluid" },
];

const detailingItems: ChecklistItem[] = [
  { id: "wash", label: "Wash" },
  { id: "polish", label: "Polish" },
  { id: "interior-clean", label: "Interior Cleaning" },
  { id: "vacuum", label: "Vacuum" },
  { id: "wax", label: "Wax" },
];

interface CommonServicesChecklistProps {
  onServiceChecked: (services: string[]) => void;
}

export const CommonServicesChecklist: React.FC<CommonServicesChecklistProps> = ({ 
  onServiceChecked 
}) => {
  const [checkedItems, setCheckedItems] = React.useState<string[]>([]);

  const handleCheckChange = (id: string, checked: boolean) => {
    let newCheckedItems: string[];
    
    if (checked) {
      newCheckedItems = [...checkedItems, id];
    } else {
      newCheckedItems = checkedItems.filter(item => item !== id);
    }
    
    setCheckedItems(newCheckedItems);
    onServiceChecked(newCheckedItems);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Common Services Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Maintenance</h3>
            <div className="space-y-2">
              {maintenanceItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id} 
                    onCheckedChange={(checked) => 
                      handleCheckChange(item.id, checked === true)
                    }
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Detailing</h3>
            <div className="space-y-2">
              {detailingItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id} 
                    onCheckedChange={(checked) => 
                      handleCheckChange(item.id, checked === true)
                    }
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
