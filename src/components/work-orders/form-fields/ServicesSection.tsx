
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { IntegratedServiceSelector } from "@/components/work-orders/fields/services/IntegratedServiceSelector";
import { ServiceSector, ServiceJob } from "@/types/service";
import { SelectedService } from "@/types/selectedService";
import { useServiceSectors } from "@/hooks/useServiceCategories";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface ServicesSectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ form }) => {
  const { sectors, loading, error } = useServiceSectors();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Update form description when services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      const serviceDescriptions = selectedServices.map(service => 
        `${service.categoryName} - ${service.subcategoryName} - ${service.name}`
      );
      const newDescription = serviceDescriptions.join('\n');
      form.setValue("description", newDescription);
    }
  }, [selectedServices, form]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    console.log('Service selected:', service.name);
  };

  const handleRemoveService = (serviceId: string) => {
    console.log('Service removed:', serviceId);
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Services</h3>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Description</FormLabel>
            <FormControl>
              <textarea
                {...field}
                placeholder="Services will be automatically populated as you select them..."
                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                rows={4}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Integrated Service Selector */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      ) : sectors.length > 0 ? (
        <IntegratedServiceSelector
          sectors={sectors}
          onServiceSelect={handleServiceSelect}
          selectedServices={selectedServices}
          onRemoveService={handleRemoveService}
          onUpdateServices={handleUpdateServices}
          onDataRefresh={() => window.location.reload()}
        />
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No services available</p>
          <p className="text-sm text-gray-400">Contact your administrator to set up services</p>
        </div>
      )}
    </div>
  );
};
