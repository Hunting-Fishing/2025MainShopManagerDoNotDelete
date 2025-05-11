
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { statusMap, priorityMap } from "@/utils/workOrders";

interface WorkOrderStatusSectionProps {
  form: UseFormReturn<any>;
}

export const WorkOrderStatusSection: React.FC<WorkOrderStatusSectionProps> = ({
  form
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Status & Priority</h3>
      
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(statusMap).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {String(label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {Object.entries(priorityMap).map(([value, { label, classes }]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`priority-${value}`} />
                      <Label
                        htmlFor={`priority-${value}`}
                        className={`rounded-full px-2 py-1 text-xs ${classes}`}
                      >
                        {label}
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
    </div>
  );
};
