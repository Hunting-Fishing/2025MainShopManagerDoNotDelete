
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { HierarchicalServiceSelector } from "@/components/work-orders/fields/services/HierarchicalServiceSelector";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { ServiceJob } from "@/types/serviceHierarchy";
import { getServiceCategories } from "@/lib/serviceHierarchy";

interface ServicesSelectionProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

interface SelectedService {
  id: string;
  name: string;
  categoryName: string;
  subcategoryName: string;
  estimatedTime?: number;
  price?: number;
}

export const ServicesSection: React.FC<ServicesSelectionProps> = ({ form }) => {
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  
  const serviceCategories = getServiceCategories();

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: service.id,
      name: service.name,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    const updatedServices = [...selectedServices, newService];
    setSelectedServices(updatedServices);
    
    // Update the form with selected services
    form.setValue("description", updatedServices.map(s => s.name).join(", "));
    
    setShowServiceSelector(false);
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId);
    setSelectedServices(updatedServices);
    form.setValue("description", updatedServices.map(s => s.name).join(", "));
  };

  const totalEstimatedTime = selectedServices.reduce((total, service) => 
    total + (service.estimatedTime || 0), 0
  );

  const totalPrice = selectedServices.reduce((total, service) => 
    total + (service.price || 0), 0
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Services & Tasks</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowServiceSelector(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Selected Services Display */}
      {selectedServices.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Selected Services</h4>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-600">
                    {service.categoryName} → {service.subcategoryName}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {service.estimatedTime && (
                      <Badge variant="secondary" className="text-xs">
                        {service.estimatedTime} min
                      </Badge>
                    )}
                    {service.price && (
                      <Badge variant="secondary" className="text-xs">
                        ${service.price}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(service.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span>Total Estimated Time:</span>
              <span className="font-medium">{totalEstimatedTime} minutes</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Estimated Cost:</span>
              <span className="font-medium">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Service Selector Modal/Popup */}
      {showServiceSelector && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Select a Service</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowServiceSelector(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <HierarchicalServiceSelector
            categories={serviceCategories}
            onServiceSelect={handleServiceSelect}
          />
        </Card>
      )}

      {/* Hidden form field for validation */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedServices.length === 0 && (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p>No services selected</p>
          <p className="text-sm">Click "Add Service" to select services for this work order</p>
        </div>
      )}
    </div>
  );
};
