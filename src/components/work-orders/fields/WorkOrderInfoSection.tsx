
import React, { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import HierarchicalServiceSelector from "./services/HierarchicalServiceSelector";
import { useServiceSelection } from "@/hooks/useServiceSelection";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/serviceHierarchy";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkOrderInfoSectionProps {
  form: any;
  serviceCategories: string[];
}

export const WorkOrderInfoSection: React.FC<WorkOrderInfoSectionProps> = ({
  form,
  serviceCategories
}) => {
  const { selectedService, clearSelectedService } = useServiceSelection();
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // When a service is selected from the Developer Portal, update the form values
  useEffect(() => {
    if (selectedService) {
      // Set service category to a formatted string that includes the full hierarchy
      form.setValue("serviceCategory", `${selectedService.mainCategory} - ${selectedService.subcategory} - ${selectedService.job}`);
      
      // If estimated time is provided, convert from minutes to hours
      if (selectedService.estimatedTime) {
        form.setValue("estimatedHours", selectedService.estimatedTime / 60);
      }
    }
  }, [selectedService, form]);

  // Load service categories from the Developer Portal
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const fetchedCategories = await fetchServiceCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading service categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

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

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">Loading service categories...</div>
            </CardContent>
          </Card>
        ) : categories.length > 0 ? (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Available Service Categories</CardTitle>
              <CardDescription>Select a category to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex flex-col p-3 border rounded-md bg-white hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => {
                      const firstSubcat = category.subcategories[0];
                      const firstJob = firstSubcat?.jobs[0];
                      if (firstSubcat && firstJob) {
                        handleServiceSelected({
                          mainCategory: category.name,
                          subcategory: firstSubcat.name,
                          job: firstJob.name,
                          estimatedTime: firstJob.estimatedTime
                        });
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {category.subcategories.length} subcategories
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {category.description || `Imported from ${category.name} sheet`}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>No service categories found.</p>
                <p className="text-sm mt-1">Visit the Service Management page to create service categories.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/developer/service-management'}
                >
                  Go to Service Management
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                  step="0.1" // Allow decimal hours for more precise estimates
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
