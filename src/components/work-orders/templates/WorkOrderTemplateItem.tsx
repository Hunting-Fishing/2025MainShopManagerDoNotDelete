
import { WorkOrderTemplate } from "@/types/workOrder";
import { formatDate } from "@/utils/workOrderUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, User, Tag, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WorkOrderTemplateItemProps {
  template: WorkOrderTemplate;
  onSelect: () => void;
  onDelete?: () => void;
}

export const WorkOrderTemplateItem: React.FC<WorkOrderTemplateItemProps> = ({
  template,
  onSelect,
  onDelete
}) => {
  const hasInventoryItems = template.inventoryItems && template.inventoryItems.length > 0;
  const inventoryItemsCount = hasInventoryItems ? template.inventoryItems.length : 0;

  return (
    <Card className="hover:border-blue-300 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription>
          {template.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Status: </span>
              <span className="font-medium">{template.status || "Not specified"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Tech: </span>
              <span className="font-medium">{template.technician || "Unassigned"}</span>
            </div>
            {template.last_used && (
              <div className="flex items-center space-x-2 col-span-2">
                <CalendarClock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Last used: </span>
                <span className="font-medium">{formatDate(template.last_used)}</span>
              </div>
            )}
            {hasInventoryItems && (
              <div className="flex items-center space-x-2 col-span-2">
                <Package2 className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Items: </span>
                <span className="font-medium">{inventoryItemsCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="default" size="sm" onClick={onSelect}>
              Use Template
            </Button>
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
