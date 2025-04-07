
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { 
  VinField, 
  YearField, 
  MakeField, 
  ModelField, 
  LicensePlateField 
} from "./VehicleFormFields";
import { decodeVin } from "@/utils/vehicleUtils";
import { useToast } from "@/hooks/use-toast";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";
import { VinDecodeResult } from "@/types/vehicle";

interface VehicleSelectorProps {
  form: UseFormReturn<any>;
  index: number;
  onRemove: (index: number) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  form,
  index,
  onRemove
}) => {
  const { toast } = useToast();
  const [decodedVehicle, setDecodedVehicle] = useState<VinDecodeResult | null>(null);
  const vin = form.watch(`vehicles.${index}.vin`);

  // Handle VIN decoding
  useEffect(() => {
    const handleVinDecode = async () => {
      if (vin?.length === 17) {
        try {
          const decodedData = await decodeVin(vin);
          if (decodedData) {
            // Update decodedVehicle state
            setDecodedVehicle(decodedData);
            
            // Set form values from decoded VIN
            form.setValue(`vehicles.${index}.make`, decodedData.make || '');
            form.setValue(`vehicles.${index}.model`, decodedData.model || '');
            form.setValue(`vehicles.${index}.year`, decodedData.year || '');
            
            toast({
              title: "VIN Decoded Successfully",
              description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model}`,
              variant: "success",
            });
          }
        } catch (error) {
          console.error("Error decoding VIN:", error);
          toast({
            title: "Error",
            description: "Failed to decode VIN. Please enter vehicle details manually.",
            variant: "destructive",
          });
        }
      }
    };
    
    handleVinDecode();
  }, [vin, form, index, toast]);

  return (
    <Card className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 rounded-full"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VinField form={form} index={index} />
          <LicensePlateField form={form} index={index} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <YearField 
            form={form} 
            index={index}
            years={Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)}
          />
          <MakeField 
            form={form} 
            index={index} 
            makes={[]} 
            onMakeChange={() => {}}
          />
          <ModelField 
            form={form} 
            index={index} 
            models={[]}
            selectedMake=""
          />
        </div>
        <VehicleAdditionalDetails form={form} index={index} decodedDetails={decodedVehicle} />
      </CardContent>
    </Card>
  );
};
