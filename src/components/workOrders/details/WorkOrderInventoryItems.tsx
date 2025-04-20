
import React from 'react';
import { WorkOrder, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderPartsEstimate } from "./WorkOrderPartsEstimate";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkOrderInventoryItemsProps {
  workOrder: WorkOrder;
}

export function WorkOrderInventoryItems({ workOrder }: WorkOrderInventoryItemsProps) {
  const items = workOrder.inventoryItems || [];
  
  if (items.length === 0) {
    return (
      <Card className="bg-white shadow-sm border">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center">
            <Package className="h-5 w-5 mr-2 text-slate-500" />
            Parts & Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-slate-500">
            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-lg font-medium mb-1">No inventory items</p>
            <p className="text-sm">No parts or inventory items have been added to this work order.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader className={cn("bg-slate-50 border-b flex flex-row items-center justify-between")}>
        <CardTitle className="text-lg flex items-center">
          <Package className="h-5 w-5 mr-2 text-slate-500" />
          Parts & Inventory ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <WorkOrderPartsEstimate items={items} />
      </CardContent>
    </Card>
  );
}
