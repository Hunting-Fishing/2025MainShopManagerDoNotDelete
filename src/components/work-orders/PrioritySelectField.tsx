
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { WorkOrder } from "@/types/workOrder";
import { priorityMap } from "@/utils/workOrders";
import { PriorityBadge } from "./PriorityBadge";

interface PrioritySelectFieldProps {
  name: string;
  label?: string;
  form: any;
  disabled?: boolean;
}

export const PrioritySelectField = ({ name, label = "Priority", form, disabled }: PrioritySelectFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select priority">
                  {field.value && (
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={field.value as WorkOrder["priority"]} />
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(priorityMap).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={value as WorkOrder["priority"]} />
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};
