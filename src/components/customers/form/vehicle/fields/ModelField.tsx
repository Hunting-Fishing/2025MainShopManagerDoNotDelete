
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HelpCircle, Car } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarModel } from "@/types/vehicle";

interface ModelFieldProps extends BaseFieldProps {
  models: CarModel[];
  selectedMake?: string;
}

export const ModelField: React.FC<ModelFieldProps> = ({ 
  form, 
  index, 
  models = [], 
  selectedMake 
}) => {
  // Ensure models is valid array
  const safeModels = Array.isArray(models) ? models : [];
  
  // Get the current form values safely
  const currentValues = form.getValues();
  const vehicleData = currentValues.vehicles?.[index];
  const decodedModel = vehicleData?.decoded_model;
  
  console.log('ModelField render - models:', safeModels);
  console.log('ModelField render - selectedMake:', selectedMake);
  console.log('ModelField render - current form value:', form.getValues(`vehicles.${index}.model`));
  
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.model`}
      render={({ field }) => {
        console.log('ModelField field value:', field.value);
        
        return (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Model</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Vehicle model (e.g., Camry, F-150)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Show decoded model information if available and no database entries */}
            {decodedModel && decodedModel !== 'Unknown' && safeModels.length === 0 && (
              <div className="mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Car className="h-3 w-3 mr-1" />
                  VIN Decoded: {decodedModel}
                </Badge>
              </div>
            )}

            {safeModels.length > 0 ? (
              <Select
                value={field.value || ""}
                onValueChange={(value) => {
                  console.log("Model field value changed to:", value);
                  field.onChange(value);
                }}
                disabled={field.disabled || !selectedMake}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {safeModels
                    .filter(model => model.model_name && model.model_display) // Filter out invalid models
                    .map((model) => (
                      <SelectItem key={`${model.make_id}-${model.model_name}`} value={model.model_name}>
                        {model.model_display}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedModel && decodedModel !== 'Unknown' ? `VIN decoded: ${decodedModel}` : "Enter vehicle model"}
                  value={field.value || decodedModel || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
