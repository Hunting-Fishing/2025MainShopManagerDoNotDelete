
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

interface WorkOrderStatusSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export const WorkOrderStatusSection: React.FC<WorkOrderStatusSectionProps> = ({ form }) => {
  // Status options with labels
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];
  
  // Priority options with labels and styling classes
  const priorityOptions = [
    { value: "low", label: "Low", classes: "bg-slate-100 text-slate-700" },
    { value: "medium", label: "Medium", classes: "bg-blue-100 text-blue-700" },
    { value: "high", label: "High", classes: "bg-red-100 text-red-700" }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Status Field */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Priority Field */}
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Priority</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-2"
              >
                {priorityOptions.map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-1">
                    <RadioGroupItem value={priority.value} id={`priority-${priority.value}`} />
                    <Label
                      htmlFor={`priority-${priority.value}`}
                      className={`rounded-full px-2 py-1 text-xs ${priority.classes}`}
                    >
                      {priority.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
