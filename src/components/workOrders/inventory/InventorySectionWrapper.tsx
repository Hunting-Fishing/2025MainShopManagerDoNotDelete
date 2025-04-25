import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { WorkOrderInventoryField } from "./WorkOrderInventoryField";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { useInventoryStatus } from "@/hooks/inventory/useInventoryStatus";

interface InventorySectionWrapperProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  readOnly?: boolean;
}

export function InventorySectionWrapper({ form, readOnly = false }: InventorySectionWrapperProps) {
  // Update useInventoryStatus call to pass an empty object
  const inventoryStatus = useInventoryStatus({});
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          Parts & Materials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WorkOrderInventoryField form={form} readOnly={readOnly} />
      </CardContent>
    </Card>
  );
}
