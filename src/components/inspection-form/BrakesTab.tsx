
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Disc, AlertTriangle, Check, Gauge, Disc2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BrakeItem {
  name: string;
  status: 'good' | 'fair' | 'replace';
  thicknessMM: number;
  originalThicknessMM: number;
}

const BrakesTab = () => {
  const [frontBrakes, setFrontBrakes] = useState<BrakeItem>({
    name: "Front Brake Pads",
    status: 'good',
    thicknessMM: 8,
    originalThicknessMM: 12,
  });

  const [rearBrakes, setRearBrakes] = useState<BrakeItem>({
    name: "Rear Brake Pads",
    status: 'good',
    thicknessMM: 9,
    originalThicknessMM: 12,
  });

  const [rotors, setRotors] = useState<{
    frontLeft: 'good' | 'warped' | 'scored' | 'replace',
    frontRight: 'good' | 'warped' | 'scored' | 'replace',
    rearLeft: 'good' | 'warped' | 'scored' | 'replace',
    rearRight: 'good' | 'warped' | 'scored' | 'replace',
  }>({
    frontLeft: 'good',
    frontRight: 'good',
    rearLeft: 'good',
    rearRight: 'good',
  });

  const [brakeFluid, setBrakeFluid] = useState<{
    level: 'full' | 'low' | 'critical',
    condition: 'clear' | 'dirty' | 'contaminated',
    lastChanged: string
  }>({
    level: 'full',
    condition: 'clear',
    lastChanged: '',
  });

  const [notes, setNotes] = useState('');

  const getBrakeStatus = (thicknessMM: number) => {
    if (thicknessMM >= 6) {
      return { status: 'good', label: 'Good', color: 'text-green-600', bgColor: 'bg-green-100', icon: <Check className="h-5 w-5" /> };
    } else if (thicknessMM >= 4) {
      return { status: 'fair', label: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <AlertTriangle className="h-5 w-5" /> };
    } else {
      return { status: 'replace', label: 'Replace', color: 'text-red-600', bgColor: 'bg-red-100', icon: <AlertCircle className="h-5 w-5" /> };
    }
  };

  const handleFrontBrakeChange = (values: number[]) => {
    const thicknessMM = values[0];
    const status = getBrakeStatus(thicknessMM).status;
    setFrontBrakes({ ...frontBrakes, thicknessMM, status: status as 'good' | 'fair' | 'replace' });
  };

  const handleRearBrakeChange = (values: number[]) => {
    const thicknessMM = values[0];
    const status = getBrakeStatus(thicknessMM).status;
    setRearBrakes({ ...rearBrakes, thicknessMM, status: status as 'good' | 'fair' | 'replace' });
  };

  const handleOriginalThicknessChange = (type: 'front' | 'rear', value: string) => {
    const thickness = parseInt(value) || 0;
    if (type === 'front') {
      setFrontBrakes({ ...frontBrakes, originalThicknessMM: thickness });
    } else {
      setRearBrakes({ ...rearBrakes, originalThicknessMM: thickness });
    }
  };

  // Calculate the percentage worn for visualization purposes
  const calculateWearPercentage = (current: number, original: number) => {
    if (original <= 0) return 0;
    const worn = original - current;
    const percentage = (worn / original) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Front Brake Pads Card */}
        <Card className="border-2 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Disc className="h-5 w-5" /> Front Brake Pads
              </h3>
              <div className={`px-3 py-1 rounded-full font-medium text-sm ${
                getBrakeStatus(frontBrakes.thicknessMM).bgColor} ${
                getBrakeStatus(frontBrakes.thicknessMM).color} border border-white/20 bg-white/90 shadow-md`}>
                {getBrakeStatus(frontBrakes.thicknessMM).icon}
                <span className="ml-1">{getBrakeStatus(frontBrakes.thicknessMM).label}</span>
              </div>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-end gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="front-original" className="text-sm font-medium mb-1 block">Original Thickness</Label>
                  <div className="relative">
                    <Input 
                      id="front-original" 
                      type="number" 
                      min="6" 
                      max="12" 
                      value={frontBrakes.originalThicknessMM}
                      onChange={(e) => handleOriginalThicknessChange('front', e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mm</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="front-current" className="text-sm font-medium mb-1 block">Current Thickness</Label>
                  <div className="relative">
                    <Input 
                      id="front-current" 
                      type="number" 
                      min="0" 
                      max={frontBrakes.originalThicknessMM} 
                      value={frontBrakes.thicknessMM}
                      onChange={(e) => handleFrontBrakeChange([parseInt(e.target.value) || 0])}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mm</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">Brake Pad Thickness</span>
                  <span className="font-bold text-purple-600">{frontBrakes.thicknessMM} mm</span>
                </div>
                <Slider
                  value={[frontBrakes.thicknessMM]}
                  min={0}
                  max={frontBrakes.originalThicknessMM}
                  step={0.5}
                  onValueChange={handleFrontBrakeChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-red-500">0 mm</span>
                  <span className="text-amber-500">4 mm</span>
                  <span className="text-green-500">{frontBrakes.originalThicknessMM} mm</span>
                </div>
              </div>

              {/* Brake pad visualization */}
              <div className="relative h-14 bg-gray-100 rounded-md overflow-hidden shadow-inner mt-4">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-md ${
                    frontBrakes.thicknessMM >= 6
                      ? "bg-gradient-to-r from-green-400 to-green-500" 
                      : frontBrakes.thicknessMM >= 4
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                  } transition-all duration-300 ease-in-out`}
                  style={{ width: `${calculateWearPercentage(frontBrakes.thicknessMM, frontBrakes.originalThicknessMM)}%` }}
                />
                <div className="absolute top-0 right-0 h-full flex items-center">
                  <div className="h-14 w-2 bg-gray-700 rounded-sm shadow-md"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center">
                  <div className="h-full flex items-center justify-center w-full text-sm font-medium text-gray-800">
                    {frontBrakes.thicknessMM} mm of {frontBrakes.originalThicknessMM} mm
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2 text-center">
                Minimum safe thickness: 3mm
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rear Brake Pads Card */}
        <Card className="border-2 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Disc className="h-5 w-5" /> Rear Brake Pads
              </h3>
              <div className={`px-3 py-1 rounded-full font-medium text-sm ${
                getBrakeStatus(rearBrakes.thicknessMM).bgColor} ${
                getBrakeStatus(rearBrakes.thicknessMM).color} border border-white/20 bg-white/90 shadow-md`}>
                {getBrakeStatus(rearBrakes.thicknessMM).icon}
                <span className="ml-1">{getBrakeStatus(rearBrakes.thicknessMM).label}</span>
              </div>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-end gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="rear-original" className="text-sm font-medium mb-1 block">Original Thickness</Label>
                  <div className="relative">
                    <Input 
                      id="rear-original" 
                      type="number" 
                      min="6" 
                      max="12" 
                      value={rearBrakes.originalThicknessMM}
                      onChange={(e) => handleOriginalThicknessChange('rear', e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mm</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="rear-current" className="text-sm font-medium mb-1 block">Current Thickness</Label>
                  <div className="relative">
                    <Input 
                      id="rear-current" 
                      type="number" 
                      min="0" 
                      max={rearBrakes.originalThicknessMM} 
                      value={rearBrakes.thicknessMM}
                      onChange={(e) => handleRearBrakeChange([parseInt(e.target.value) || 0])}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mm</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">Brake Pad Thickness</span>
                  <span className="font-bold text-blue-600">{rearBrakes.thicknessMM} mm</span>
                </div>
                <Slider
                  value={[rearBrakes.thicknessMM]}
                  min={0}
                  max={rearBrakes.originalThicknessMM}
                  step={0.5}
                  onValueChange={handleRearBrakeChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-red-500">0 mm</span>
                  <span className="text-amber-500">4 mm</span>
                  <span className="text-green-500">{rearBrakes.originalThicknessMM} mm</span>
                </div>
              </div>

              {/* Brake pad visualization */}
              <div className="relative h-14 bg-gray-100 rounded-md overflow-hidden shadow-inner mt-4">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-md ${
                    rearBrakes.thicknessMM >= 6
                      ? "bg-gradient-to-r from-green-400 to-green-500" 
                      : rearBrakes.thicknessMM >= 4
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                  } transition-all duration-300 ease-in-out`}
                  style={{ width: `${calculateWearPercentage(rearBrakes.thicknessMM, rearBrakes.originalThicknessMM)}%` }}
                />
                <div className="absolute top-0 right-0 h-full flex items-center">
                  <div className="h-14 w-2 bg-gray-700 rounded-sm shadow-md"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center">
                  <div className="h-full flex items-center justify-center w-full text-sm font-medium text-gray-800">
                    {rearBrakes.thicknessMM} mm of {rearBrakes.originalThicknessMM} mm
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 text-center">
                Minimum safe thickness: 3mm
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Brake Rotors Section */}
      <Card className="border-2 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Disc2 className="h-5 w-5" /> Brake Rotors
          </h3>
        </div>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Front Left Rotor</h4>
                <RadioGroup 
                  value={rotors.frontLeft}
                  onValueChange={(value) => setRotors({...rotors, frontLeft: value as any})}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="good" id="fl-good" />
                    <Label htmlFor="fl-good" className="flex-1 cursor-pointer">Good Condition</Label>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="warped" id="fl-warped" />
                    <Label htmlFor="fl-warped" className="flex-1 cursor-pointer">Warped</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="scored" id="fl-scored" />
                    <Label htmlFor="fl-scored" className="flex-1 cursor-pointer">Scored</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="replace" id="fl-replace" />
                    <Label htmlFor="fl-replace" className="flex-1 cursor-pointer">Needs Replacement</Label>
                    <span className="text-red-500">✗</span>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Front Right Rotor</h4>
                <RadioGroup 
                  value={rotors.frontRight}
                  onValueChange={(value) => setRotors({...rotors, frontRight: value as any})}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="good" id="fr-good" />
                    <Label htmlFor="fr-good" className="flex-1 cursor-pointer">Good Condition</Label>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="warped" id="fr-warped" />
                    <Label htmlFor="fr-warped" className="flex-1 cursor-pointer">Warped</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="scored" id="fr-scored" />
                    <Label htmlFor="fr-scored" className="flex-1 cursor-pointer">Scored</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="replace" id="fr-replace" />
                    <Label htmlFor="fr-replace" className="flex-1 cursor-pointer">Needs Replacement</Label>
                    <span className="text-red-500">✗</span>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Rear Left Rotor</h4>
                <RadioGroup 
                  value={rotors.rearLeft}
                  onValueChange={(value) => setRotors({...rotors, rearLeft: value as any})}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="good" id="rl-good" />
                    <Label htmlFor="rl-good" className="flex-1 cursor-pointer">Good Condition</Label>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="warped" id="rl-warped" />
                    <Label htmlFor="rl-warped" className="flex-1 cursor-pointer">Warped</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="scored" id="rl-scored" />
                    <Label htmlFor="rl-scored" className="flex-1 cursor-pointer">Scored</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="replace" id="rl-replace" />
                    <Label htmlFor="rl-replace" className="flex-1 cursor-pointer">Needs Replacement</Label>
                    <span className="text-red-500">✗</span>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Rear Right Rotor</h4>
                <RadioGroup 
                  value={rotors.rearRight}
                  onValueChange={(value) => setRotors({...rotors, rearRight: value as any})}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="good" id="rr-good" />
                    <Label htmlFor="rr-good" className="flex-1 cursor-pointer">Good Condition</Label>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="warped" id="rr-warped" />
                    <Label htmlFor="rr-warped" className="flex-1 cursor-pointer">Warped</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="scored" id="rr-scored" />
                    <Label htmlFor="rr-scored" className="flex-1 cursor-pointer">Scored</Label>
                    <span className="text-amber-500">!</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                    <RadioGroupItem value="replace" id="rr-replace" />
                    <Label htmlFor="rr-replace" className="flex-1 cursor-pointer">Needs Replacement</Label>
                    <span className="text-red-500">✗</span>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Brake Fluid Section */}
      <Card className="border-2 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Gauge className="h-5 w-5" /> Brake Fluid
          </h3>
        </div>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">Fluid Level</h4>
              <RadioGroup 
                value={brakeFluid.level}
                onValueChange={(value) => setBrakeFluid({...brakeFluid, level: value as any})}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <RadioGroupItem value="full" id="fluid-full" />
                  <Label htmlFor="fluid-full" className="flex-1 cursor-pointer">Full</Label>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <RadioGroupItem value="low" id="fluid-low" />
                  <Label htmlFor="fluid-low" className="flex-1 cursor-pointer">Low</Label>
                  <span className="text-amber-500">!</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <RadioGroupItem value="critical" id="fluid-critical" />
                  <Label htmlFor="fluid-critical" className="flex-1 cursor-pointer">Critically Low</Label>
                  <span className="text-red-500">✗</span>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">Fluid Condition</h4>
              <RadioGroup 
                value={brakeFluid.condition}
                onValueChange={(value) => setBrakeFluid({...brakeFluid, condition: value as any})}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <RadioGroupItem value="clear" id="fluid-clear" />
                  <Label htmlFor="fluid-clear" className="flex-1 cursor-pointer">Clear</Label>
                  <span className="text-green-500">✓</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <RadioGroupItem value="dirty" id="fluid-dirty" />
                  <Label htmlFor="fluid-dirty" className="flex-1 cursor-pointer">Dirty/Dark</Label>
                  <span className="text-amber-500">!</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <RadioGroupItem value="contaminated" id="fluid-contaminated" />
                  <Label htmlFor="fluid-contaminated" className="flex-1 cursor-pointer">Contaminated</Label>
                  <span className="text-red-500">✗</span>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrakesTab;
