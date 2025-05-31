
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { ServiceSelectionManager } from "./ServiceSelectionManager";
import { ServiceLineItemData } from "./ServiceLineItem";

interface ServicesSectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ form }) => {
  const [selectedServices, setSelectedServices] = useState<ServiceLineItemData[]>([]);

  // Update form description when services change
  const handleServicesChange = (services: ServiceLineItemData[]) => {
    setSelectedServices(services);
    
    // Generate description from selected services
    const serviceDescriptions = services.map(service => 
      `${service.code} - ${service.name}${service.quantity > 1 ? ` (${service.quantity})` : ''}`
    );
    
    const description = serviceDescriptions.join('\n');
    form.setValue("description", description);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Services</h3>
      </div>

      {/* Service Selection Manager */}
      <ServiceSelectionManager
        selectedServices={selectedServices}
        onServicesChange={handleServicesChange}
        showSelectionMode={true}
      />

      {/* Hidden form field to store the description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormLabel>Service Description</FormLabel>
            <FormControl>
              <textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
