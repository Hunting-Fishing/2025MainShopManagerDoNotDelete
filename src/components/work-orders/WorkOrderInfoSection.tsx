
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface WorkOrderInfoSectionProps {
  form: any;
  serviceCategories: string[];
}

export const WorkOrderInfoSection: React.FC<WorkOrderInfoSectionProps> = ({
  form,
  serviceCategories
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Work Order Details</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="serviceCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
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
          name="estimatedHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter estimated hours"
                  className="bg-white"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
