
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../WorkOrderCreateForm";

interface WorkOrderPartsSectionsProps {
  form: UseFormReturn<any>;
}

export const WorkOrderPartsSections: React.FC<WorkOrderPartsSectionsProps> = ({ form }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Parts and Services</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          Parts management section placeholder. Add parts to this work order.
        </div>
      </CardContent>
    </Card>
  );
};
