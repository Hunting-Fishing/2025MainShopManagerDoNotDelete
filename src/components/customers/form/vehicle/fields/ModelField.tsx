
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarModel } from "@/types/vehicle";

interface ModelFieldProps extends BaseFieldProps {
  models: CarModel[];
  selectedMake: string;
  isLoading?: boolean;
}

export const ModelField: React.FC<ModelFieldProps> = ({ 
  form, 
  index, 
  models = [], 
  selectedMake,
  isLoading = false
}) => {
  // Get current model value from form
  const modelValue = form.watch(`vehicles.${index}.model`) || "";
  
  // Effect to validate model value exists in the models list when loaded
  useEffect(() => {
    if (!isLoading && models.length > 0 && modelValue) {
      console.log(`Checking if model "${modelValue}" exists in ${models.length} available models`);
      
      const modelExists = models.some(
        model => model.model_name && model.model_name.toLowerCase() === modelValue.toLowerCase()
      );
      
      // Log the model validation result
      console.log(`Model "${modelValue}" exists in models list: ${modelExists}`);
      
      // If model value doesn't match any available models, try to find closest match
      if (!modelExists) {
        // Try to find a case-insensitive match
        const caseInsensitiveMatch = models.find(
          model => model.model_name && model.model_name.toLowerCase() === modelValue.toLowerCase()
        );
        
        if (caseInsensitiveMatch && caseInsensitiveMatch.model_name) {
          console.log(`Found case-insensitive model match for "${modelValue}": "${caseInsensitiveMatch.model_name}"`);
          form.setValue(`vehicles.${index}.model`, caseInsensitiveMatch.model_name);
        }
      }
    }
  }, [models, modelValue, isLoading, form, index]);

  const handleModelChange = (value: string) => {
    console.log(`Model selected: ${value}`);
    form.setValue(`vehicles.${index}.model`, value);
    form.trigger(`vehicles.${index}.model`);
  };

  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.model`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Model</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Specific vehicle model (e.g., Camry, F-150)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={field.value || ""}
            onValueChange={handleModelChange}
            disabled={!selectedMake || field.disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Loading models...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading models...</SelectItem>
              ) : !selectedMake ? (
                <SelectItem value="select-make" disabled>Select make first</SelectItem>
              ) : models.length > 0 ? (
                models
                  .filter(model => model.model_name) // Filter out invalid models
                  .sort((a, b) => a.model_name.localeCompare(b.model_name)) // Sort alphabetically
                  .map((model) => (
                    <SelectItem key={model.model_name} value={model.model_name}>
                      {model.model_name}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="no-models" disabled>No models available for {selectedMake}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
