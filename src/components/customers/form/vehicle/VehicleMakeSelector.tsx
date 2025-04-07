
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";

interface VehicleMakeSelectorProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}

export const VehicleMakeSelector: React.FC<VehicleMakeSelectorProps> = ({ form, index }) => {
  const { makes, loading } = useVehicleData();
  const make = form.watch(`vehicles.${index}.make`);

  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.make`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Make</FormLabel>
          <Select
            value={field.value || "_none"}
            onValueChange={(value) => {
              if (value !== "_none") {
                field.onChange(value);
                // Reset model when make changes
                form.setValue(`vehicles.${index}.model`, '');
              }
            }}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select make" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="_none" disabled>Select make</SelectItem>
              {makes.map((make) => (
                <SelectItem key={make.make_id} value={make.make_id || "_unknown"}>
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
