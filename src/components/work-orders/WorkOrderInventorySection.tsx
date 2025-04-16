
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<any>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({ form }) => {
  // In a real implementation, this would manage inventory items
  // For now, this is a simplified placeholder component
  return (
    <FormField
      control={form.control}
      name="inventoryItems"
      render={() => (
        <FormItem className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-semibold">Parts & Inventory</CardTitle>
                <Button variant="outline" size="sm" className="h-8">
                  <PlusCircle className="mr-1 h-3.5 w-3.5" />
                  Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-center text-sm text-muted-foreground py-8">
                No parts added to this work order yet.
              </div>
            </CardContent>
          </Card>
        </FormItem>
      )}
    />
  );
};
