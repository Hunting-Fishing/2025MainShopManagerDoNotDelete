
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";

export const ModelField: React.FC<BaseFieldProps & {
  models: any[];
  selectedMake: string;
}> = ({ form, index, models, selectedMake }) => {
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
                  <p>Specific model of the vehicle (e.g., F-150, Corolla, Civic)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
            disabled={!selectedMake || models.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {models.length > 0 ? (
                models.map(model => (
                  <SelectItem key={model.model_name} value={model.model_name}>
                    {model.model_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-models" disabled>
                  {selectedMake ? "No models available" : "Select a make first"}
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
