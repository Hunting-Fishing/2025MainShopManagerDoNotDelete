
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";

interface BaseFieldProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}

// VIN Input Field
export const VinField: React.FC<BaseFieldProps> = ({ form, index }) => {
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.vin`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>VIN</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              placeholder="Enter 17-digit VIN to auto-populate" 
              className="font-mono"
            />
          </FormControl>
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
export const YearField: React.FC<BaseFieldProps & { years: number[] }> = ({ form, index, years }) => {
  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.year`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Year</FormLabel>
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
          <FormLabel>Make</FormLabel>
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
          <FormLabel>Model</FormLabel>
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
          <FormLabel>License Plate</FormLabel>
          <FormControl>
            <Input {...field} placeholder="License Plate Number" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
