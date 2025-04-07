
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { VinDecodeResult } from "@/types/vehicle";

// Import refactored components
import { VinDecoderField } from "./VinDecoderField";
import { BasicVehicleFields } from "./BasicVehicleFields";
import { DecodedVehicleFields } from "./DecodedVehicleFields";

interface VehicleDetailsFieldProps {
  form: any;
  isFleetCustomer?: boolean;
}

export const VehicleDetailsField: React.FC<VehicleDetailsFieldProps> = ({ 
  form, 
  isFleetCustomer = false 
}) => {
  const [searchParams] = useSearchParams();
  const vehicleInfo = searchParams.get('vehicleInfo');
  const vehicleId = searchParams.get('vehicleId') || '';
  const [decodedVehicle, setDecodedVehicle] = useState<VinDecodeResult | null>(null);
  
  // Parse vehicle info - assuming format "YEAR MAKE MODEL"
  const vehicleParts = vehicleInfo?.split(' ') || [];
  const vehicleYear = vehicleParts[0] || '';
  const vehicleMake = vehicleParts.length > 1 ? vehicleParts[1] : '';
  const vehicleModel = vehicleParts.length > 2 ? vehicleParts.slice(2).join(' ') : '';
  
  // If a VIN exists in the form, attempt to decode it on component mount
  const vin = form.watch("vin");
  
  // Handler for when VIN is successfully decoded
  const handleVehicleDecoded = (vehicleData: VinDecodeResult) => {
    setDecodedVehicle(vehicleData);
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* VIN Decoder Field */}
          <VinDecoderField 
            form={form} 
            onVehicleDecoded={handleVehicleDecoded} 
          />

          {/* Basic Vehicle Information Fields */}
          <BasicVehicleFields 
            form={form}
            vehicleMake={vehicleMake}
            vehicleModel={vehicleModel}
            vehicleYear={vehicleYear}
            vehicleId={vehicleId}
            isFleetCustomer={isFleetCustomer}
          />

          {/* Additional Decoded Vehicle Fields */}
          <DecodedVehicleFields 
            form={form}
            decodedVehicle={decodedVehicle}
          />
        </div>
      </CardContent>
    </Card>
  );
};
