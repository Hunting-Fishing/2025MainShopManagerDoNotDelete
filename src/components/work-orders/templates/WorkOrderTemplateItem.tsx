import { Calendar, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkOrderTemplate } from "@/types/workOrder";
import { format } from "date-fns";

interface WorkOrderTemplateItemProps {
  template: WorkOrderTemplate;
  onSelect: () => void;
  onDelete: () => void;
}

export const WorkOrderTemplateItem: React.FC<WorkOrderTemplateItemProps> = ({
  template,
  onSelect,
  onDelete
}) => {
  // Format the template last used date if it exists
  const formattedLastUsed = template.lastUsed 
    ? new Date(template.lastUsed).toLocaleDateString() 
    : 'Never used';

  // Count inventory items if they exist
  const itemCount = template.inventoryItems && Array.isArray(template.inventoryItems) 
    ? template.inventoryItems.length 
    : 0;

  return (
    <Card className="hover:bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">{template.name}</h4>
            <p className="text-sm text-gray-500">{template.description}</p>
            
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Used {template.usageCount} times</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Last used: {formattedLastUsed}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span>{itemCount} items</span>
              </div>
            </div>
          </div>
          
          <Button size="sm" onClick={onSelect}>
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
