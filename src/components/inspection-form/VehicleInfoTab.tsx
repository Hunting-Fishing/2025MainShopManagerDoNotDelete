
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car, Search, AlertCircle } from "lucide-react";
import { VehicleBodyStyle } from '@/types/vehicleBodyStyles';
import { useToast } from "@/hooks/use-toast";
import { decodeVin } from "@/utils/vehicleUtils";

const VehicleInfoTab = () => {
  const { toast } = useToast();
  const [isDecoding, setIsDecoding] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    licensePlate: "",
    color: "",
    bodyStyle: "sedan" as VehicleBodyStyle,
    mileage: ""
  });

  const handleChange = (field: string, value: string) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVinDecode = async () => {
    if (!vehicleInfo.vin || vehicleInfo.vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN",
        variant: "destructive",
      });
      return;
    }

    setIsDecoding(true);
    try {
      const decodedData = await decodeVin(vehicleInfo.vin);
      if (decodedData) {
        setVehicleInfo(prev => ({
          ...prev,
          make: decodedData.make || prev.make,
          model: decodedData.model || prev.model,
          year: decodedData.year || prev.year,
          // Use the body_style from the decoded data if available
          bodyStyle: (decodedData.body_style as VehicleBodyStyle) || prev.bodyStyle
        }));

        toast({
          title: "VIN Decoded Successfully",
          description: `Vehicle identified as ${decodedData.year} ${decodedData.make} ${decodedData.model}`,
          variant: "success",
        });
        
        console.log("Decoded vehicle body style:", decodedData.body_style);
      } else {
        toast({
          title: "VIN Decode Failed",
          description: "Could not decode the provided VIN. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error decoding VIN:", error);
      toast({
        title: "Error",
        description: "An error occurred while decoding the VIN.",
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-blue-100 shadow-md transition-all hover:shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center text-blue-900">
            <Car className="mr-3 h-6 w-6 text-blue-700" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* VIN and search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="vin" className="text-sm font-medium mb-1.5 block">VIN</Label>
                <div className="relative">
                  <Input 
                    id="vin" 
                    placeholder="Enter Vehicle Identification Number" 
                    value={vehicleInfo.vin}
                    onChange={(e) => handleChange('vin', e.target.value)}
                    className="pr-10" 
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground" 
                    type="button"
                    onClick={() => handleChange('vin', '')}
                    disabled={!vehicleInfo.vin}
                  >
                    {vehicleInfo.vin ? <AlertCircle className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block opacity-0">Search</Label>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleVinDecode}
                  disabled={isDecoding || !vehicleInfo.vin || vehicleInfo.vin.length !== 17}
                >
                  {isDecoding ? "Decoding..." : "Decode VIN"}
                </Button>
              </div>
            </div>
            
            {/* Basic vehicle info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="make" className="text-sm font-medium mb-1.5 block">Make</Label>
                <Input 
                  id="make" 
                  placeholder="e.g. Toyota" 
                  value={vehicleInfo.make}
                  onChange={(e) => handleChange('make', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-sm font-medium mb-1.5 block">Model</Label>
                <Input 
                  id="model" 
                  placeholder="e.g. Camry" 
                  value={vehicleInfo.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-sm font-medium mb-1.5 block">Year</Label>
                <Input 
                  id="year" 
                  placeholder="e.g. 2023" 
                  value={vehicleInfo.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                />
              </div>
            </div>
            
            {/* Additional vehicle details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license" className="text-sm font-medium mb-1.5 block">License Plate</Label>
                <Input 
                  id="license" 
                  placeholder="e.g. ABC123" 
                  value={vehicleInfo.licensePlate}
                  onChange={(e) => handleChange('licensePlate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="color" className="text-sm font-medium mb-1.5 block">Color</Label>
                <Input 
                  id="color" 
                  placeholder="e.g. Silver" 
                  value={vehicleInfo.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodyStyle" className="text-sm font-medium mb-1.5 block">Body Style</Label>
                <Select 
                  value={vehicleInfo.bodyStyle} 
                  onValueChange={(value) => handleChange('bodyStyle', value as VehicleBodyStyle)}
                >
                  <SelectTrigger id="bodyStyle" className="bg-white">
                    <SelectValue placeholder="Select body style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Body style will be automatically detected when decoding VIN
                </p>
              </div>
              <div>
                <Label htmlFor="mileage" className="text-sm font-medium mb-1.5 block">Mileage</Label>
                <Input 
                  id="mileage" 
                  placeholder="e.g. 45000" 
                  type="number"
                  value={vehicleInfo.mileage}
                  onChange={(e) => handleChange('mileage', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pass the updated vehicle body style to the parent component */}
      <input type="hidden" name="vehicleBodyStyle" value={vehicleInfo.bodyStyle} />
    </div>
  );
};

export default VehicleInfoTab;
