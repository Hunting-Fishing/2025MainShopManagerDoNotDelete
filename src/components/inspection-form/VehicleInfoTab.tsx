
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car, Search } from "lucide-react";
import { VehicleBodyStyle } from '@/types/vehicleBodyStyles';

const VehicleInfoTab = () => {
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
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block opacity-0">Search</Label>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Decode VIN
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
                  <SelectTrigger id="bodyStyle">
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
