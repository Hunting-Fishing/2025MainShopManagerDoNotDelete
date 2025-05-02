
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import HierarchicalServiceSelector from "./services/HierarchicalServiceSelector";

interface WorkOrderInfoSectionProps {
  form: any;
  serviceCategories: string[];
}

export const WorkOrderInfoSection: React.FC<WorkOrderInfoSectionProps> = ({
  form,
  serviceCategories
}) => {
  // Handle selection from the hierarchical selector
  const handleServiceSelected = (service: {
    mainCategory: string;
    subcategory: string;
    job: string;
    estimatedTime?: number;
  }) => {
    // Update the form values
    form.setValue("serviceCategory", `${service.mainCategory} - ${service.subcategory} - ${service.job}`);
    
    // If we have an estimated time, update that field too
    if (service.estimatedTime) {
      form.setValue("estimatedHours", service.estimatedTime / 60);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Work Order Details</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="serviceCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <div>
                  {/* This hidden input holds the actual form value */}
                  <input type="hidden" {...field} />
                  
                  {/* Our hierarchical selector provides the UI but updates the hidden field */}
                  <HierarchicalServiceSelector
                    onServiceSelected={handleServiceSelected}
                  />
                </div>
              </FormControl>
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
}
