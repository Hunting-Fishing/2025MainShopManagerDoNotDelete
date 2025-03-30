
import React from "react";
import { Car, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../CustomerFormSchema";
import { useVehicleForm } from "./useVehicleForm";
import { 
  VinField, 
  YearField, 
  MakeField, 
  ModelField, 
  LicensePlateField 
} from "./VehicleFormFields";

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
    error,
    selectedMake,
    handleMakeChange
  } = useVehicleForm({ form, index });

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

      {/* VIN Field - Moved to top for better UX since it auto-populates other fields */}
      <VinField form={form} index={index} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year Field */}
        <YearField form={form} index={index} years={years} makes={makes} models={models} selectedMake={selectedMake} />

        {/* Make Field */}
        <MakeField 
          form={form} 
          index={index} 
          makes={makes} 
          onMakeChange={handleMakeChange}
        />

        {/* Model Field */}
        <ModelField 
          form={form} 
          index={index} 
          models={models} 
          selectedMake={selectedMake} 
        />

        {/* License Plate Field */}
        <LicensePlateField form={form} index={index} />
      </div>

      {error && <div className="text-sm text-destructive mt-2">{error}</div>}
    </div>
  );
};
