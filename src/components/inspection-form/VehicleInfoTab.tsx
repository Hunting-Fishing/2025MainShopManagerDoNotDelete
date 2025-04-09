
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/lib/supabase";
import { VehicleBodyStyle } from "@/types/vehicleBodyStyles";
import { Input } from "@/components/ui/input";

interface VehicleInfoTabProps {
  vehicleId: string | null;
  initialBodyStyle?: VehicleBodyStyle;
  onBodyStyleChange: (style: VehicleBodyStyle) => void;
}

interface VehicleData {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  body_style?: string; // Added this optional property
}

const VehicleInfoTab: React.FC<VehicleInfoTabProps> = ({ 
  vehicleId, 
  initialBodyStyle = VehicleBodyStyle.Sedan,
  onBodyStyleChange 
}) => {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [bodyStyle, setBodyStyle] = useState<VehicleBodyStyle>(initialBodyStyle);

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle(vehicleId);
    }
  }, [vehicleId]);

  const fetchVehicle = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setVehicleData(data);
        
        // If the vehicle has a body_style field that matches one of our enum values,
        // use that as the default body style
        if (data.body_style) {
          const styleKey = Object.keys(VehicleBodyStyle).find(
            key => VehicleBodyStyle[key as keyof typeof VehicleBodyStyle].toLowerCase() === data.body_style?.toLowerCase()
          );
          
          if (styleKey) {
            const style = VehicleBodyStyle[styleKey as keyof typeof VehicleBodyStyle];
            setBodyStyle(style);
            onBodyStyleChange(style);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBodyStyleChange = (value: string) => {
    // Ensure value is a valid VehicleBodyStyle
    if (Object.values(VehicleBodyStyle).includes(value as VehicleBodyStyle)) {
      const style = value as VehicleBodyStyle;
      setBodyStyle(style);
      onBodyStyleChange(style);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-muted-foreground">Loading vehicle information...</div>
          ) : vehicleData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input value={vehicleData.year || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Make</Label>
                <Input value={vehicleData.make || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={vehicleData.model || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>VIN</Label>
                <Input value={vehicleData.vin || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>License Plate</Label>
                <Input value={vehicleData.license_plate || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input value={vehicleData.color || ''} readOnly className="bg-muted/50" />
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-amber-600">
              Please select a vehicle to continue with the inspection.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Vehicle Body Style</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            defaultValue={bodyStyle} 
            value={bodyStyle}
            onValueChange={handleBodyStyleChange}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <Label className="flex flex-col items-center space-y-2 p-4 border rounded-md cursor-pointer data-[state=checked]:border-primary">
              <RadioGroupItem value={VehicleBodyStyle.Sedan} id="sedan" className="sr-only" />
              <div className="w-16 h-12 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('/lovable-uploads/bd96d9af-12db-494e-8e7f-609805c801a0.png')` }} />
              <span>Sedan</span>
            </Label>
            
            <Label className="flex flex-col items-center space-y-2 p-4 border rounded-md cursor-pointer data-[state=checked]:border-primary">
              <RadioGroupItem value={VehicleBodyStyle.SUV} id="suv" className="sr-only" />
              <div className="w-16 h-12 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('/lovable-uploads/332913db-cb57-4dbd-b290-3925552a3911.png')` }} />
              <span>SUV</span>
            </Label>
            
            <Label className="flex flex-col items-center space-y-2 p-4 border rounded-md cursor-pointer data-[state=checked]:border-primary">
              <RadioGroupItem value={VehicleBodyStyle.Hatchback} id="hatchback" className="sr-only" />
              <div className="w-16 h-12 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('/lovable-uploads/aa1d5122-b95b-4b2e-9109-0d70e0808da6.png')` }} />
              <span>Hatchback</span>
            </Label>
            
            <Label className="flex flex-col items-center space-y-2 p-4 border rounded-md cursor-pointer data-[state=checked]:border-primary">
              <RadioGroupItem value={VehicleBodyStyle.Truck} id="truck" className="sr-only" />
              <div className="w-16 h-12 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('/lovable-uploads/57aefd54-8d89-4b93-b523-5bd2474d84af.png')` }} />
              <span>Truck</span>
            </Label>
            
            <Label className="flex flex-col items-center space-y-2 p-4 border rounded-md cursor-pointer data-[state=checked]:border-primary">
              <RadioGroupItem value={VehicleBodyStyle.Van} id="van" className="sr-only" />
              <div className="w-16 h-12 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('/lovable-uploads/332913db-cb57-4dbd-b290-3925552a3911.png')` }} />
              <span>Van</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleInfoTab;
