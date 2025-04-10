
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VinDecodeResult } from "@/types/vehicle";
import { RotateCw } from "lucide-react";
import { decodeVinService } from "@/services/vinDecoderService";

// Define vehicle body styles enum
export type VehicleBodyStyle = 
  | "Sedan" 
  | "SUV" 
  | "Truck" 
  | "Van" 
  | "Coupe" 
  | "Wagon" 
  | "Convertible" 
  | "Hatchback" 
  | "Crossover"
  | "Minivan"
  | "Other";

interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  bodyStyle: VehicleBodyStyle;
  mileage: string;
}

interface VehicleInfoTabProps {
  vehicleInfo: VehicleInfo;
  setVehicleInfo: (value: React.SetStateAction<VehicleInfo>) => void;
}

export default function VehicleInfoTab({ vehicleInfo, setVehicleInfo }: VehicleInfoTabProps) {
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinDecodeError, setVinDecodeError] = useState<string | null>(null);
  
  const availableBodyStyles: VehicleBodyStyle[] = [
    "Sedan", "SUV", "Truck", "Van", "Coupe", "Wagon", 
    "Convertible", "Hatchback", "Crossover", "Minivan", "Other"
  ];

  // Update a single field in the vehicle info
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle VIN decoding button click
  const handleDecodeVin = async () => {
    if (!vehicleInfo.vin || vehicleInfo.vin.length < 17) {
      setVinDecodeError("Please enter a valid 17-character VIN");
      return;
    }
    
    setIsDecodingVin(true);
    setVinDecodeError(null);
    
    try {
      const decodedInfo = await decodeVinService(vehicleInfo.vin);
      if (decodedInfo) {
        updateVehicleWithDecodedInfo(decodedInfo);
      } else {
        setVinDecodeError("Could not decode VIN. Please check and try again.");
      }
    } catch (error) {
      console.error("Error decoding VIN:", error);
      setVinDecodeError("Failed to decode VIN. Please try again.");
    } finally {
      setIsDecodingVin(false);
    }
  };
  
  // Update vehicle info with data from VIN decoder
  const updateVehicleWithDecodedInfo = (decodedInfo: VinDecodeResult) => {
    setVehicleInfo(prev => {
      // Create new object with decoded data, but ensure year is a string
      const updatedInfo = {
        ...prev,
        make: decodedInfo.make || prev.make,
        model: decodedInfo.model || prev.model,
        year: decodedInfo.year ? String(decodedInfo.year) : prev.year,
        bodyStyle: mapBodyStyle(decodedInfo.body_style)
      };
      return updatedInfo;
    });
  };
  
  // Map the VIN decoder's body style to our enum values
  const mapBodyStyle = (bodyStyle?: string): VehicleBodyStyle => {
    if (!bodyStyle) return "Other";
    
    // Map common body style descriptions to our enum
    const bodyStyleMap: Record<string, VehicleBodyStyle> = {
      "sedan": "Sedan",
      "suv": "SUV",
      "truck": "Truck",
      "pickup": "Truck",
      "van": "Van",
      "coupe": "Coupe",
      "wagon": "Wagon",
      "convertible": "Convertible",
      "hatchback": "Hatchback",
      "crossover": "Crossover",
      "minivan": "Minivan"
    };
    
    // Normalize the input and check for matches
    const normalizedBodyStyle = bodyStyle.toLowerCase();
    
    for (const [key, value] of Object.entries(bodyStyleMap)) {
      if (normalizedBodyStyle.includes(key)) {
        return value;
      }
    }
    
    return "Other";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="text-sm font-medium">VIN</label>
            <div className="flex">
              <Input 
                name="vin" 
                value={vehicleInfo.vin}
                onChange={handleInputChange}
                className="rounded-r-none"
                placeholder="Vehicle Identification Number"
              />
              <Button 
                type="button"
                variant="secondary" 
                className="rounded-l-none px-2"
                onClick={handleDecodeVin}
                disabled={isDecodingVin}
              >
                {isDecodingVin ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Decode"
                )}
              </Button>
            </div>
            {vinDecodeError && (
              <p className="text-xs text-red-500 mt-1">{vinDecodeError}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">License Plate</label>
          <Input 
            name="licensePlate" 
            value={vehicleInfo.licensePlate}
            onChange={handleInputChange}
            placeholder="License Plate"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Year</label>
          <Input 
            name="year" 
            value={vehicleInfo.year}
            onChange={handleInputChange}
            placeholder="Year"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Make</label>
          <Input 
            name="make" 
            value={vehicleInfo.make}
            onChange={handleInputChange}
            placeholder="Make"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Model</label>
          <Input 
            name="model" 
            value={vehicleInfo.model}
            onChange={handleInputChange}
            placeholder="Model"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Color</label>
          <Input 
            name="color" 
            value={vehicleInfo.color}
            onChange={handleInputChange}
            placeholder="Vehicle Color"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Body Style</label>
          <select
            name="bodyStyle"
            value={vehicleInfo.bodyStyle}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
          >
            {availableBodyStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Mileage</label>
          <Input 
            name="mileage" 
            value={vehicleInfo.mileage}
            onChange={handleInputChange}
            placeholder="Current Mileage"
          />
        </div>
      </div>
    </div>
  );
}
