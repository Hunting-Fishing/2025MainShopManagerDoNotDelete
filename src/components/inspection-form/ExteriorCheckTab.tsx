
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Car, AlertTriangle, ThumbsUp, ThumbsDown, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import InspectionItem from "./shared/InspectionItem";
import ImageUploadButton from './shared/ImageUploadButton';

const ExteriorCheckTab = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border border-blue-100 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center text-blue-900">
            <Car className="mr-2 h-5 w-5 text-blue-700" />
            Exterior Inspection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
            <h3 className="font-medium text-sm">Body Condition</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                label="Driver's Side" 
                options={["Good", "Fair", "Poor", "Damaged"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <InspectionItem 
                label="Passenger Side" 
                options={["Good", "Fair", "Poor", "Damaged"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <InspectionItem 
                label="Hood" 
                options={["Good", "Fair", "Poor", "Damaged"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <InspectionItem 
                label="Roof" 
                options={["Good", "Fair", "Poor", "Damaged"]}
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-sm">Glass & Mirrors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <h3 className="font-medium text-sm">Other Checks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2 border p-3 rounded-md">
                <Checkbox id="wipers" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="wipers" className="text-sm font-medium leading-none">
                    Wiper Blades
                  </Label>
                  <p className="text-sm text-muted-foreground">Check wiper condition and function</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 border p-3 rounded-md">
                <Checkbox id="doorhandles" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="doorhandles" className="text-sm font-medium leading-none">
                    Door Handles & Locks
                  </Label>
                  <p className="text-sm text-muted-foreground">Verify all door handles and locks work</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 border p-3 rounded-md">
                <Checkbox id="rust" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="rust" className="text-sm font-medium leading-none">
                    Rust Inspection
                  </Label>
                  <p className="text-sm text-muted-foreground">Check for visible rust areas</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 border p-3 rounded-md">
                <Checkbox id="paint" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="paint" className="text-sm font-medium leading-none">
                    Paint Condition
                  </Label>
                  <p className="text-sm text-muted-foreground">Check for chips, scratches, or fading</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="exterior-notes">Additional Notes on Exterior</Label>
            <Textarea 
              id="exterior-notes"
              placeholder="Enter any additional notes about the exterior condition"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-sm">Exterior Photos</h3>
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
