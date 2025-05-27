
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { HierarchicalServiceSelector } from "@/components/work-orders/fields/services/HierarchicalServiceSelector";
import { ServiceMainCategory, ServiceJob } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/services/serviceApi";

interface ServicesSectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

interface SelectedService {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  estimatedTime?: number;
  price?: number;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ form }) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
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
        console.error("Error loading service categories:", err);
        setError("Failed to load service categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceCategories();
  }, []);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: service.id,
      name: service.name,
      category: categoryName,
      subcategory: subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    setSelectedServices(prev => [...prev, newService]);
    
    // Update form description with selected services
    const currentDescription = form.getValues("description") || "";
    const serviceDescription = `${newService.name}`;
    const updatedDescription = currentDescription 
      ? `${currentDescription}, ${serviceDescription}`
      : serviceDescription;
    
    form.setValue("description", updatedDescription);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
    
    // Update form description by removing the service
    const serviceToRemove = selectedServices.find(s => s.id === serviceId);
    if (serviceToRemove) {
      const currentDescription = form.getValues("description") || "";
      const updatedDescription = currentDescription
        .split(", ")
        .filter(desc => desc !== serviceToRemove.name)
        .join(", ");
      
      form.setValue("description", updatedDescription);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Services & Tasks</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Services & Tasks</h3>
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
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Services & Tasks</h3>
      
      {/* Service Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Description</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter service description or select from categories below..."
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected Services:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((service) => (
              <Badge key={service.id} variant="secondary" className="flex items-center gap-1">
                <span>{service.name}</span>
                {service.price && <span className="text-xs">(${service.price})</span>}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveService(service.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Service Selector */}
      {serviceCategories.length > 0 ? (
        <HierarchicalServiceSelector
          categories={serviceCategories}
          onServiceSelect={handleServiceSelect}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No service categories available.</p>
          <p className="text-sm">Import services through the Developer Portal to get started.</p>
        </div>
      )}
    </div>
  );
};
