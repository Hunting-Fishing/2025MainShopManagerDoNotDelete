
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "./WorkOrderCreateForm";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<any>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Inventory Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          Inventory management section placeholder. Add inventory items to this work order.
        </div>
      </CardContent>
    </Card>
  );
};
