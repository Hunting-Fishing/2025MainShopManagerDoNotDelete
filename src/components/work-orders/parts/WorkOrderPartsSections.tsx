
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { Plus } from "lucide-react";

interface WorkOrderPartsSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderPartsSections: React.FC<WorkOrderPartsSectionsProps> = ({ form }) => {
  const [parts, setParts] = useState<{id: string; name: string; quantity: number; price: number}[]>([]);

  const addPart = () => {
    setParts([...parts, {
      id: `part-${Date.now()}`,
      name: "",
      quantity: 1,
      price: 0
    }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Parts</h3>
        <Button type="button" variant="outline" size="sm" onClick={addPart}>
          <Plus className="w-4 h-4 mr-1" /> Add Part
        </Button>
      </div>
      
      {parts.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
          No parts added yet. Click "Add Part" to begin.
        </div>
      ) : (
        <div className="space-y-2">
          {parts.map((part) => (
            <div key={part.id} className="flex gap-2 items-center">
              {/* Part fields would go here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkOrderPartsSections;
