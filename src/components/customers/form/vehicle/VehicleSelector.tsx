
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
} from "./fields";
import { decodeVin } from "@/utils/vehicleUtils";
import { useToast } from "@/hooks/use-toast";
import { VehicleAdditionalDetails } from "./VehicleAdditionalDetails";
import { VinDecodeResult } from "@/types/vehicle";
import { useVehicleData } from "@/hooks/useVehicleData";

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
  const { fetchModels, makes, models } = useVehicleData();
  const [decodedVehicle, setDecodedVehicle] = useState<VinDecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const vin = form.watch(`vehicles.${index}.vin`);
  const make = form.watch(`vehicles.${index}.make`);

  useEffect(() => {
    if (make) {
      fetchModels(make);
    }
  }, [make, fetchModels]);

  useEffect(() => {
    const handleVinDecode = async () => {
      if (vin?.length === 17 && !isDecoding) {
        setIsDecoding(true);
        try {
          console.log(`Starting VIN decode for ${vin}`);
          const decodedData = await decodeVin(vin);
          
          if (decodedData) {
            console.log("Decoded VIN data:", decodedData);
            setDecodedVehicle(decodedData);
            
            // Set primary fields immediately - this ensures they appear in the form fields
            form.setValue(`vehicles.${index}.make`, decodedData.make || '');
            form.setValue(`vehicles.${index}.model`, decodedData.model || '');
            form.setValue(`vehicles.${index}.year`, decodedData.year || '');
            
            // Set all additional fields from the decoded data
            if (decodedData.trim) form.setValue(`vehicles.${index}.trim`, decodedData.trim);
            if (decodedData.transmission) form.setValue(`vehicles.${index}.transmission`, decodedData.transmission);
            if (decodedData.transmission_type) form.setValue(`vehicles.${index}.transmission_type`, decodedData.transmission_type);
            if (decodedData.drive_type) form.setValue(`vehicles.${index}.drive_type`, decodedData.drive_type);
            if (decodedData.fuel_type) form.setValue(`vehicles.${index}.fuel_type`, decodedData.fuel_type);
            if (decodedData.engine) form.setValue(`vehicles.${index}.engine`, decodedData.engine);
            if (decodedData.body_style) form.setValue(`vehicles.${index}.body_style`, decodedData.body_style);
            if (decodedData.country) form.setValue(`vehicles.${index}.country`, decodedData.country);
            if (decodedData.gvwr) form.setValue(`vehicles.${index}.gvwr`, decodedData.gvwr);
            
            // If the make has changed, update the models
            if (decodedData.make) {
              await fetchModels(decodedData.make);
            }
            
            toast({
              title: "VIN Decoded Successfully",
              description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model} ${decodedData.trim || ''}`,
              variant: "success",
            });
            
            // Force a form validation after setting values
            form.trigger([
              `vehicles.${index}.make`, 
              `vehicles.${index}.model`,
              `vehicles.${index}.year`
            ]);
          } else {
            toast({
              title: "VIN Decode Notice",
              description: "Limited vehicle information available for this VIN.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error decoding VIN:", error);
          toast({
            title: "Error",
            description: "Failed to decode VIN. Please enter vehicle details manually.",
            variant: "destructive",
          });
        } finally {
          setIsDecoding(false);
        }
      }
    };
    
    handleVinDecode();
  }, [vin, form, index, toast, fetchModels, isDecoding]);

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
          <VinField 
            form={form} 
            index={index} 
            processing={isDecoding}
            decodedVehicleInfo={decodedVehicle ? {
              year: decodedVehicle.year?.toString(),
              make: decodedVehicle.make,
              model: decodedVehicle.model,
              valid: !!decodedVehicle.make
            } : undefined}
          />
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
            makes={makes} 
            onMakeChange={(make) => {
              // When make changes, refresh models and reset model value
              fetchModels(make);
              form.setValue(`vehicles.${index}.model`, '');
            }}
          />
          <ModelField 
            form={form} 
            index={index} 
            models={models}
            selectedMake={make}
          />
        </div>
        <VehicleAdditionalDetails form={form} index={index} decodedDetails={decodedVehicle} />
      </CardContent>
    </Card>
  );
};
