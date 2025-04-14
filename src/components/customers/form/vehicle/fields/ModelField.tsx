
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
  // Get current model value from form
  const modelValue = form.watch(`vehicles.${index}.model`) || "";

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
            onValueChange={(value) => {
              console.log(`Setting model to: ${value}`);
              field.onChange(value);
            }}
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
            <SelectContent className="max-h-[300px]">
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading models...</SelectItem>
              ) : !selectedMake ? (
                <SelectItem value="select-make" disabled>Select make first</SelectItem>
              ) : models.length > 0 ? (
                models
                  .filter(model => model.model_name) // Filter out invalid models
                  .map((model) => (
                    <SelectItem key={model.model_name} value={model.model_name}>
                      {model.model_name}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="no-models" disabled>No models available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
