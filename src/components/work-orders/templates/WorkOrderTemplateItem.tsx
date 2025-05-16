
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { WorkOrderTemplate } from "@/types/workOrder";

export interface WorkOrderTemplateItemProps {
  template: WorkOrderTemplate;
  onSelect: () => void;
  onDelete?: () => void;
}

export const WorkOrderTemplateItem: React.FC<WorkOrderTemplateItemProps> = ({
  template,
  onSelect,
  onDelete,
}) => {
  const lastUsed = template.last_used
    ? formatDistanceToNow(new Date(template.last_used), { addSuffix: true })
    : "Never used";

  const inventoryItemsCount = template.inventoryItems ? template.inventoryItems.length : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          {template.technician && (
            <p>Technician: {template.technician}</p>
          )}
          {template.location && (
            <p>Location: {template.location}</p>
          )}
          {template.usage_count !== undefined && (
            <p>
              Used {template.usage_count} time{template.usage_count !== 1 ? "s" : ""}
            </p>
          )}
          <p>Last used: {lastUsed}</p>
          {inventoryItemsCount > 0 && (
            <p>Parts: {inventoryItemsCount} item{inventoryItemsCount !== 1 ? "s" : ""}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={onSelect}
          variant="default"
          size="sm"
          className="w-full"
        >
          Use Template
        </Button>
        {onDelete && (
          <Button 
            onClick={onDelete} 
            variant="outline" 
            size="sm"
            className="ml-2"
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
