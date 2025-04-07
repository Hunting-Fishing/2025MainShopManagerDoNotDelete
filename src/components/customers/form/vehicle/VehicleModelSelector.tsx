
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";

interface VehicleModelSelectorProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}

export const VehicleModelSelector: React.FC<VehicleModelSelectorProps> = ({ form, index }) => {
  const { fetchModels, models, loading } = useVehicleData();
  const make = form.watch(`vehicles.${index}.make`);
  const [hasLoadedModels, setHasLoadedModels] = useState(false);

  useEffect(() => {
    if (make && make !== "_none") {
      fetchModels(make).then(() => {
        setHasLoadedModels(true);
      });
    }
  }, [make, fetchModels]);

  return (
    <FormField
      control={form.control}
      name={`vehicles.${index}.model`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model</FormLabel>
          <Select
            value={field.value || "_none"}
            onValueChange={(value) => {
              if (value !== "_none") {
                field.onChange(value);
              }
            }}
            disabled={!make || loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="_none" disabled>
                {!make 
                  ? "Select make first" 
                  : loading 
                    ? "Loading models..." 
                    : models.length === 0 
                      ? "No models available" 
                      : "Select model"
                }
              </SelectItem>
              {models.map((model) => (
                <SelectItem key={model.model_name} value={model.model_name || "_unknown"}>
                  {model.model_name}
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
