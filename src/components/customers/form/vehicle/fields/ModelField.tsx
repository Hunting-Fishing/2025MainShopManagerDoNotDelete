
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";
import { CarModel } from "@/types/vehicle";

interface ModelFieldProps extends BaseFieldProps {
  models: CarModel[];
  selectedMake: string;
}

export const ModelField: React.FC<ModelFieldProps> = ({ form, index, models = [], selectedMake }) => {
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
            onValueChange={field.onChange}
            disabled={!selectedMake || field.disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={selectedMake ? "Select model" : "Select make first"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {!selectedMake ? (
                <SelectItem value="" disabled>Select make first</SelectItem>
              ) : models.length > 0 ? (
                models.map((model) => (
                  <SelectItem 
                    key={model.model_name} 
                    value={model.model_name}
                  >
                    {model.model_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No models available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
