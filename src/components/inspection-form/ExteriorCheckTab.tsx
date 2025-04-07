
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Car, AlertTriangle, ThumbsUp, ThumbsDown, Upload, PanelLeft, PanelRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import InspectionItem from "./shared/InspectionItem";
import ImageUploadButton from './shared/ImageUploadButton';
import InteractiveVehicle from './shared/InteractiveVehicle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExteriorCheckTab = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeVehicleTab, setActiveVehicleTab] = useState("interactive");
  
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-blue-100 shadow-md transition-all hover:shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center text-blue-900">
            <Car className="mr-3 h-6 w-6 text-blue-700" />
            Vehicle Damage Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue={activeVehicleTab} onValueChange={setActiveVehicleTab} className="w-full">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="interactive" className="flex-1">
                <PanelLeft className="h-4 w-4 mr-2" />
                Interactive View
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex-1">
                <PanelRight className="h-4 w-4 mr-2" />
                Checklist View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="interactive" className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-medium mb-4 text-blue-800">Click on any part of the vehicle to mark damage</h3>
                <InteractiveVehicle />
              </div>
            </TabsContent>
            
            <TabsContent value="checklist" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <InspectionItem 
                  label="Front Bumper" 
                  options={["Good", "Fair", "Poor", "Damaged"]}
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
                <InspectionItem 
                  label="Rear Bumper" 
                  options={["Good", "Fair", "Poor", "Damaged"]}
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
                <InspectionItem 
                  label="Hood" 
                  options={["Good", "Fair", "Poor", "Damaged"]}
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
                <InspectionItem 
                  label="Trunk" 
                  options={["Good", "Fair", "Poor", "Damaged"]}
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
                <InspectionItem 
                  label="Driver's Side Panels" 
                  options={["Good", "Fair", "Poor", "Damaged"]}
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
                <InspectionItem 
                  label="Passenger Side Panels" 
                  options={["Good", "Fair", "Poor", "Damaged"]}
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border border-blue-100 shadow-md transition-all hover:shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center text-blue-900">
            <Car className="mr-3 h-6 w-6 text-blue-700" />
            Exterior Inspection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <InspectionItem 
              label="Headlights" 
              options={["Working", "Dim", "Not Working"]}
              icon={<ThumbsUp className="h-4 w-4" />} 
            />
            <InspectionItem 
              label="Tail Lights" 
              options={["Working", "Dim", "Not Working"]}
              icon={<ThumbsUp className="h-4 w-4" />} 
            />
            <InspectionItem 
              label="Turn Signals" 
              options={["Working", "Dim", "Not Working"]}
              icon={<ThumbsUp className="h-4 w-4" />} 
            />
            <InspectionItem 
              label="Brake Lights" 
              options={["Working", "Dim", "Not Working"]}
              icon={<ThumbsUp className="h-4 w-4" />} 
            />
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-lg">Glass & Mirrors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InspectionItem 
                label="Windshield" 
                options={["Clear", "Chipped", "Cracked"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <InspectionItem 
                label="Rear Window" 
                options={["Clear", "Chipped", "Cracked"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <InspectionItem 
                label="Driver's Mirror" 
                options={["Good", "Damaged", "Missing"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <InspectionItem 
                label="Passenger Mirror" 
                options={["Good", "Damaged", "Missing"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-lg">Other Checks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                <Checkbox id="wipers" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="wipers" className="text-base font-medium leading-none">
                    Wiper Blades
                  </Label>
                  <p className="text-sm text-muted-foreground">Check wiper condition and function</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                <Checkbox id="doorhandles" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="doorhandles" className="text-base font-medium leading-none">
                    Door Handles & Locks
                  </Label>
                  <p className="text-sm text-muted-foreground">Verify all door handles and locks work</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                <Checkbox id="rust" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="rust" className="text-base font-medium leading-none">
                    Rust Inspection
                  </Label>
                  <p className="text-sm text-muted-foreground">Check for visible rust areas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md">
                <Checkbox id="paint" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="paint" className="text-base font-medium leading-none">
                    Paint Condition
                  </Label>
                  <p className="text-sm text-muted-foreground">Check for chips, scratches, or fading</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="exterior-notes" className="text-lg">Additional Notes on Exterior</Label>
            <Textarea 
              id="exterior-notes"
              placeholder="Enter any additional notes about the exterior condition"
              className="min-h-[100px] text-base"
            />
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Exterior Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ImageUploadButton label="Front View" />
              <ImageUploadButton label="Rear View" />
              <ImageUploadButton label="Driver's Side" />
              <ImageUploadButton label="Passenger Side" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExteriorCheckTab;
