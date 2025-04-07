
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Car, FileText } from "lucide-react";
import { mockMakes } from "@/data/vehicleMakes";

const VehicleInfoTab = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  
  const [searchByVin, setSearchByVin] = useState(false);
  
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border border-purple-100 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center text-purple-900">
            <Car className="mr-2 h-5 w-5 text-purple-700" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Search Vehicle</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchByVin(!searchByVin)}
                className="text-xs h-8 px-2"
              >
                {searchByVin ? "Enter Manually" : "Search by VIN"}
              </Button>
            </div>
            
            {searchByVin ? (
              <div className="mt-2 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="vin">VIN Number</Label>
                    <div className="flex mt-1">
                      <Input id="vin" placeholder="Enter VIN" className="rounded-r-none" />
                      <Button className="rounded-l-none">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Enter the Vehicle Identification Number (VIN) to automatically populate vehicle details</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Make" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMakes.map(make => (
                        <SelectItem key={make.make_id} value={make.make_id}>
                          {make.make_display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Enter Model" />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="Enter Color" />
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <Label htmlFor="license">License Plate</Label>
              <Input id="license" placeholder="Enter License Plate" />
            </div>
            <div>
              <Label htmlFor="odometer">Odometer</Label>
              <Input id="odometer" placeholder="Enter Mileage" type="number" />
            </div>
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Input id="customer" placeholder="Enter Customer Name" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter Phone Number" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border border-blue-100 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center text-blue-900">
            <FileText className="mr-2 h-5 w-5 text-blue-700" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Special Notes or Requests</Label>
              <textarea 
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter any additional information or special requests from the customer"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrival">Arrival Date</Label>
                <Input id="arrival" type="date" />
              </div>
              <div>
                <Label htmlFor="technician">Assigned Technician</Label>
                <Input id="technician" placeholder="Enter Technician Name" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleInfoTab;
