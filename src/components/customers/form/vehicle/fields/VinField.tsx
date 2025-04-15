
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HelpCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseFieldProps } from "./BaseFieldTypes";

interface VinFieldProps extends BaseFieldProps {
  processing?: boolean;
  success?: boolean;
  failure?: boolean;
}

export const VinField: React.FC<VinFieldProps> = ({ 
  form, 
  index,
  processing = false,
  success = false,
  failure = false
}) => {
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.vin`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>VIN</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>17-character Vehicle Identification Number</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {processing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {success && <CheckCircle className="h-4 w-4 text-green-500" />}
            {failure && <AlertCircle className="h-4 w-4 text-amber-500" />}
          </div>
          <FormControl>
            <Input
              {...field}
              value={field.value || ''}
              placeholder="Vehicle Identification Number"
              className="font-mono"
              maxLength={17}
              onChange={(e) => {
                const upperValue = e.target.value.toUpperCase();
                field.onChange(upperValue);
              }}
            />
          </FormControl>
          <FormMessage />
          
          {field.value && field.value.length > 0 && field.value.length < 17 && (
            <p className="text-xs text-muted-foreground mt-1">
              VIN should be 17 characters ({17 - field.value.length} more needed)
            </p>
          )}
          
          {success && (
            <p className="text-xs text-green-600 mt-1">
              VIN decoded successfully
            </p>
          )}
        </FormItem>
      )}
    />
  );
};
