
import React from "react";
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
  const handleModelChange = (value: string) => {
    console.log(`Model selected: ${value}`);
    form.setValue(`vehicles.${index}.model`, value);
    form.trigger(`vehicles.${index}.model`);
  };

  // Check if the current model value exists in the models array
  const modelValue = form.watch(`vehicles.${index}.model`);
  
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
               !isLoading && (
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
