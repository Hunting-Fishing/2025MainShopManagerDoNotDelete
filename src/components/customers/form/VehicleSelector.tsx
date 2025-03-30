
import React, { useEffect } from "react";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Car, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { useVehicleData } from "@/hooks/useVehicleData";
import { Input } from "@/components/ui/input";

interface VehicleSelectorProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
  onRemove: (index: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ 
  form, 
  index,
  onRemove
}) => {
  const { 
    makes, 
    models, 
    years, 
    loading, 
    error,
    fetchModels 
  } = useVehicleData();

  const selectedMake = form.watch(`vehicles.${index}.make`);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake);
    }
  }, [selectedMake, fetchModels]);

  const handleMakeChange = (value: string) => {
    // Update the form
    form.setValue(`vehicles.${index}.make`, value);
    // Clear the model since it depends on make
    form.setValue(`vehicles.${index}.model`, '');
    // Fetch models for this make
    fetchModels(value);
  };

  return (
    <div className="border rounded-md p-4 space-y-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-muted-foreground" />
          <h4 className="text-md font-medium">Vehicle #{index + 1}</h4>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemove(index)}
          type="button"
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year Field */}
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

        {/* Make Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.make`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <Select 
                onValueChange={handleMakeChange} 
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

        {/* Model Field */}
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

        {/* VIN Field */}
        <FormField
          control={form.control}
          name={`vehicles.${index}.vin`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>VIN</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vehicle Identification Number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* License Plate Field */}
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
      </div>

      {error && <div className="text-sm text-destructive mt-2">{error}</div>}
    </div>
  );
};
