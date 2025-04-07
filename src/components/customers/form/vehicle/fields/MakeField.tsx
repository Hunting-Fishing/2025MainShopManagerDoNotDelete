
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";

export const MakeField: React.FC<BaseFieldProps & { 
  makes: any[]; 
  onMakeChange: (value: string) => void 
}> = ({ form, index, makes, onMakeChange }) => {
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.make`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Make</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Vehicle manufacturer (e.g., Ford, Toyota, Honda)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            onValueChange={onMakeChange} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Make" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {makes.map(make => (
                <SelectItem key={make.make_id} value={make.make_id}>
                  {make.make_display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
