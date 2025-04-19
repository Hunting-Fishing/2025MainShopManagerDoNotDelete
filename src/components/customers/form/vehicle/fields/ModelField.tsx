
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarModel } from "@/types/vehicle";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface ModelFieldProps extends BaseFieldProps {
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
  const handleModelChange = (value: string) => {
    console.log(`Model selected: ${value}`);
    form.setValue(`vehicles.${index}.model`, value);
    form.trigger(`vehicles.${index}.model`);
  };

  // Get current model value
  const modelValue = form.watch(`vehicles.${index}.model`);

  // Debug logging
  useEffect(() => {
    if (isLoading) {
      console.log('Model field is loading models for make:', selectedMake);
    } else if (models.length > 0) {
      console.log(`Loaded ${models.length} models for make:`, selectedMake);
    }
    
    // Debug log to track model value
    console.log(`Current model value in ModelField:`, modelValue);
  }, [isLoading, models, selectedMake, modelValue]);
  
  // Effect to ensure model is visible once loaded
  useEffect(() => {
    if (modelValue && !isLoading && selectedMake) {
      // Force model to be set again after models are loaded to ensure it appears in UI
      const timer = setTimeout(() => {
        console.log(`Re-asserting model value: ${modelValue}`);
        form.setValue(`vehicles.${index}.model`, modelValue);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [models, isLoading, selectedMake, modelValue, form, index]);
  
  const hasLoadedModels = models.length > 0;
  
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
            disabled={!selectedMake || field.disabled}
          >
            <FormControl>
              <SelectTrigger className="bg-white">
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner className="mr-2" size="sm" />
                    <span>Loading models...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading models...</SelectItem>
              ) : !selectedMake ? (
                <SelectItem value="select-make" disabled>Select make first</SelectItem>
              ) : models.length > 0 ? (
                models
                  .filter(model => model.model_name)
                  .sort((a, b) => a.model_name.localeCompare(b.model_name))
                  .map((model) => (
                    <SelectItem key={model.model_name} value={model.model_name}>
                      {model.model_name}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="no-models" disabled>No models available for {selectedMake}</SelectItem>
              )}
              
              {/* Add current model if it doesn't exist in the models array */}
              {modelValue && 
               !models.some(m => m.model_name.toLowerCase() === modelValue.toLowerCase()) && 
               !isLoading && modelValue !== "loading" && modelValue !== "select-make" && modelValue !== "no-models" && (
                <SelectItem value={modelValue} key={modelValue}>
                  {modelValue}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
