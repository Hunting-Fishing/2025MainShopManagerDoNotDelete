
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { HierarchicalServiceSelector } from "@/components/work-orders/fields/services/HierarchicalServiceSelector";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { ServiceJob, ServiceMainCategory } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/services/serviceApi";
import { useToast } from "@/hooks/use-toast";

interface ServicesSelectionProps {
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

export const ServicesSection: React.FC<ServicesSelectionProps> = ({ form }) => {
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real service categories from the database
  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        setLoading(true);
        const categories = await fetchServiceCategories();
        setServiceCategories(categories);
      } catch (error) {
        console.error("Error loading service categories:", error);
        toast({
          title: "Error",
          description: "Failed to load service categories. Please check if services are configured in the Developer portal.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadServiceCategories();
  }, [toast]);

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
    setShowServiceSelector(false);
    
    // Update form description with selected services
    const currentDescription = form.getValues("description") || "";
    const serviceDescription = `${newService.name} (${newService.category} - ${newService.subcategory})`;
    const updatedDescription = currentDescription 
      ? `${currentDescription}, ${serviceDescription}`
      : serviceDescription;
    
    form.setValue("description", updatedDescription);
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
  };

  const totalEstimatedTime = selectedServices.reduce((total, service) => 
    total + (service.estimatedTime || 0), 0
  );
  
  const totalPrice = selectedServices.reduce((total, service) => 
    total + (service.price || 0), 0
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold">Services & Tasks</h3>
        <div className="text-center py-6 text-gray-500">
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (serviceCategories.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold">Services & Tasks</h3>
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="font-medium">No services configured</p>
          <p className="text-sm">Please configure services in the Developer portal first</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.open('/developer/service-management', '_blank')}
          >
            Configure Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services & Tasks</h3>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={() => setShowServiceSelector(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {showServiceSelector && (
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Services</h4>
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => setShowServiceSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <HierarchicalServiceSelector
              categories={serviceCategories}
              onServiceSelect={handleServiceSelect}
            />
          </CardContent>
        </Card>
      )}

      {selectedServices.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Selected Services</h4>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div 
                key={service.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-gray-500">
                    {service.category} → {service.subcategory}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {service.estimatedTime && (
                      <Badge variant="outline" className="text-xs">
                        {service.estimatedTime} min
                      </Badge>
                    )}
                    {service.price && (
                      <Badge variant="outline" className="text-xs">
                        ${service.price}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(service.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {(totalEstimatedTime > 0 || totalPrice > 0) && (
            <div className="flex gap-4 pt-2 border-t">
              {totalEstimatedTime > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Total Time: </span>
                  <span className="font-medium">{totalEstimatedTime} minutes</span>
                </div>
              )}
              {totalPrice > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Total Price: </span>
                  <span className="font-medium">${totalPrice}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
