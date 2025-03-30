
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { Loader2, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface BaseFieldProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}

// VIN Input Field
export const VinField: React.FC<BaseFieldProps & { 
  processing?: boolean;
  decodedVehicleInfo?: {
    year?: string;
    make?: string;
    model?: string;
    valid: boolean;
  };
}> = ({ form, index, processing = false, decodedVehicleInfo }) => {
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
                <TooltipContent side="right" className="max-w-sm">
                  <p>Vehicle Identification Number - A 17-character unique identifier for the vehicle. Enter a complete VIN to auto-populate vehicle details.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <FormControl>
              <Input 
                {...field} 
                placeholder="Enter 17-digit VIN to auto-populate" 
                className="font-mono pr-8"
                maxLength={17}
                disabled={processing}
                onChange={(e) => {
                  // Convert to uppercase as user types
                  field.onChange(e.target.value.toUpperCase());
                }}
              />
            </FormControl>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              {processing && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!processing && decodedVehicleInfo && (
                decodedVehicleInfo.valid ? 
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                  <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
          
          {decodedVehicleInfo && decodedVehicleInfo.valid && decodedVehicleInfo.make && decodedVehicleInfo.model && (
            <div className="mt-2 text-sm">
              <Badge variant="outline" className="bg-muted/50 mr-2">
                {decodedVehicleInfo.year || ''}
              </Badge>
              <Badge variant="outline" className="bg-muted/50 mr-2">
                {decodedVehicleInfo.make || ''}
              </Badge>
              <Badge variant="outline" className="bg-muted/50">
                {decodedVehicleInfo.model || ''}
              </Badge>
            </div>
          )}
          
          <FormDescription>
            Enter a complete 17-digit VIN to auto-populate vehicle details
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Year Field
export const YearField: React.FC<BaseFieldProps & { 
  years: number[] 
}> = ({ form, index, years }) => {
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.year`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Year</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Manufacturing year of the vehicle</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
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

// Make Field
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

// Model Field
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

// License Plate Field
export const LicensePlateField: React.FC<BaseFieldProps> = ({ form, index }) => {
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.license_plate`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>License Plate</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Registration plate number assigned by state/province</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FormControl>
            <Input {...field} placeholder="License Plate Number" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
