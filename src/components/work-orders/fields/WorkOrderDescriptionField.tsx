import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { serviceCategories, serviceAreas, commonServices } from "@/data/workServiceCategories";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkOrderDescriptionFieldProps {
  form: any;
}

export const WorkOrderDescriptionField: React.FC<WorkOrderDescriptionFieldProps> = ({ form }) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const currentDescription = form.watch("description") || "";
  
  const handleAreaChange = (area: string) => {
    if (!selectedAreas.includes(area)) {
      const newAreas = [...selectedAreas, area];
      setSelectedAreas(newAreas);
      updateDescription(newAreas, selectedServices);
    }
  };
  
  const handleServiceChange = (service: string) => {
    if (!selectedServices.includes(service)) {
      const newServices = [...selectedServices, service];
      setSelectedServices(newServices);
      updateDescription(selectedAreas, newServices);
    }
  };
  
  const removeArea = (area: string) => {
    const newAreas = selectedAreas.filter(a => a !== area);
    setSelectedAreas(newAreas);
    updateDescription(newAreas, selectedServices);
  };
  
  const removeService = (service: string) => {
    const newServices = selectedServices.filter(s => s !== service);
    setSelectedServices(newServices);
    updateDescription(newAreas, newServices);
  };
  
  const updateDescription = (areas: string[], services: string[]) => {
    const areaLabels = areas.map(area => 
      serviceAreas.find(a => a.value === area)?.label || area
    );
    
    const serviceLabels = services.map(service => 
      commonServices.find(s => s.value === service)?.label || service
    );
    
    let description = currentDescription;
    
    if (areaLabels.length > 0) {
      description = `Work Areas: ${areaLabels.join(", ")}\n`;
    }
    
    if (serviceLabels.length > 0) {
      description += `Services: ${serviceLabels.join(", ")}\n`;
    }
    
    // Keep any custom text after our generated part
    const customTextMatch = currentDescription.match(/(?:Work Areas:|Services:).*\n\n(.*)/s);
    if (customTextMatch && customTextMatch[1]) {
      description += `\n${customTextMatch[1]}`;
    }
    
    form.setValue("description", description);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="serviceCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Category</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("description", 
                  `Category: ${serviceCategories.find(cat => cat.value === value)?.label}\n` + 
                  (currentDescription || "")
                );
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <Tabs defaultValue="areas">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="areas">Service Areas</TabsTrigger>
          <TabsTrigger value="services">Common Services</TabsTrigger>
        </TabsList>
        <TabsContent value="areas" className="space-y-4">
          <FormItem>
            <FormLabel>Service Areas</FormLabel>
            <Select onValueChange={handleAreaChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service area" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {serviceAreas.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedAreas.map(area => {
                const areaLabel = serviceAreas.find(a => a.value === area)?.label || area;
                return (
                  <Badge key={area} variant="secondary" className="flex items-center gap-1">
                    {areaLabel}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeArea(area)} />
                  </Badge>
                );
              })}
            </div>
          </FormItem>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <FormItem>
            <FormLabel>Common Services</FormLabel>
            <Select onValueChange={handleServiceChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {commonServices.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedServices.map(service => {
                const serviceLabel = commonServices.find(s => s.value === service)?.label || service;
                return (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1">
                    {serviceLabel}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeService(service)} />
                  </Badge>
                );
              })}
            </div>
          </FormItem>
        </TabsContent>
      </Tabs>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description & Instructions</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter detailed description and instructions for the work order..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
