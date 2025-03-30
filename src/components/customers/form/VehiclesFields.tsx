
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";
import { VehicleSelector } from "./vehicle/VehicleSelector";
import { Button } from "@/components/ui/button";
import { Plus, Car } from "lucide-react";

interface VehiclesFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
}

export const VehiclesFields: React.FC<VehiclesFieldsProps> = ({ form }) => {
  const vehicles = form.watch('vehicles') || [];

  const addVehicle = () => {
    const currentVehicles = form.getValues('vehicles') || [];
    form.setValue('vehicles', [
      ...currentVehicles,
      { make: '', model: '', year: '', vin: '', license_plate: '' }
    ]);
  };

  const removeVehicle = (index: number) => {
    const currentVehicles = form.getValues('vehicles') || [];
    form.setValue(
      'vehicles',
      currentVehicles.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Car className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Vehicles</h3>
      </div>

      {vehicles.length > 0 ? (
        <div className="space-y-4">
          {vehicles.map((vehicle, index) => (
            <VehicleSelector
              key={index}
              form={form}
              index={index}
              onRemove={removeVehicle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md border-dashed">
          <Car className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No vehicles added yet</p>
        </div>
      )}

      <Button 
        type="button" 
        variant="outline" 
        className="mt-4" 
        onClick={addVehicle}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Vehicle
      </Button>
    </>
  );
};
