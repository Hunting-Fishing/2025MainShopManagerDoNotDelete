
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { HierarchicalServiceSelector } from "@/components/work-orders/fields/services/HierarchicalServiceSelector";
import { ServiceMainCategory, ServiceJob } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/services/serviceApi";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";

interface ServicesSectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ form }) => {
  const [serviceCategories, setServiceCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categories = await fetchServiceCategories();
        setServiceCategories(categories);
      } catch (err) {
        console.error("Failed to load service categories:", err);
        setError("Failed to load service categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceCategories();
  }, []);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const currentDescription = form.getValues("description") || "";
    const serviceDescription = `${categoryName} - ${subcategoryName} - ${service.name}`;
    
    // Update form description with selected service
    const newDescription = currentDescription 
      ? `${currentDescription}\n${serviceDescription}`
      : serviceDescription;
    
    form.setValue("description", newDescription);
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
                placeholder="Enter service description..."
                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Service Selector */}
      {isLoading ? (
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
      ) : serviceCategories.length > 0 ? (
        <HierarchicalServiceSelector
          categories={serviceCategories}
          onServiceSelect={handleServiceSelect}
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
