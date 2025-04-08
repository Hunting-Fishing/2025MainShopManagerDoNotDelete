
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Disc, AlertTriangle, Check, Gauge, Disc2, AlertCircle } from "lucide-react";

interface BrakeItem {
  name: string;
  status: 'good' | 'fair' | 'replace';
  wearPercentage: number;
}

const BrakesTab = () => {
  const [frontBrakes, setFrontBrakes] = useState<BrakeItem>({
    name: "Front Brake Pads",
    status: 'good',
    wearPercentage: 25,
  });

  const [rearBrakes, setRearBrakes] = useState<BrakeItem>({
    name: "Rear Brake Pads",
    status: 'good',
    wearPercentage: 20,
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

  const getBrakeStatus = (wearPercentage: number) => {
    if (wearPercentage < 30) {
      return { status: 'good', label: 'Good', color: 'text-green-600', bgColor: 'bg-green-100', icon: <Check className="h-5 w-5" /> };
    } else if (wearPercentage < 70) {
      return { status: 'fair', label: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <AlertTriangle className="h-5 w-5" /> };
    } else {
      return { status: 'replace', label: 'Replace', color: 'text-red-600', bgColor: 'bg-red-100', icon: <AlertCircle className="h-5 w-5" /> };
    }
  };

  const handleFrontBrakeChange = (values: number[]) => {
    const wearPercentage = values[0];
    const status = getBrakeStatus(wearPercentage).status;
    setFrontBrakes({ ...frontBrakes, wearPercentage, status: status as 'good' | 'fair' | 'replace' });
  };

  const handleRearBrakeChange = (values: number[]) => {
    const wearPercentage = values[0];
    const status = getBrakeStatus(wearPercentage).status;
    setRearBrakes({ ...rearBrakes, wearPercentage, status: status as 'good' | 'fair' | 'replace' });
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
                getBrakeStatus(frontBrakes.wearPercentage).bgColor} ${
                getBrakeStatus(frontBrakes.wearPercentage).color} border border-white/20 bg-white/90 shadow-md`}>
                {getBrakeStatus(frontBrakes.wearPercentage).icon}
                <span className="ml-1">{getBrakeStatus(frontBrakes.wearPercentage).label}</span>
              </div>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">Brake Pad Wear</span>
                  <span className="font-bold text-purple-600">{frontBrakes.wearPercentage}% Worn</span>
                </div>
                <Slider
                  value={[frontBrakes.wearPercentage]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={handleFrontBrakeChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-green-500">New</span>
                  <span className="text-amber-500">Fair</span>
                  <span className="text-red-500">Replace</span>
                </div>
              </div>

              {/* Brake pad visualization */}
              <div className="relative h-12 bg-gray-100 rounded-md overflow-hidden shadow-inner mt-4">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-md ${
                    frontBrakes.wearPercentage < 30 
                      ? "bg-gradient-to-r from-green-400 to-green-500" 
                      : frontBrakes.wearPercentage < 70 
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                  } transition-all duration-300 ease-in-out`}
                  style={{ width: `${frontBrakes.wearPercentage}%` }}
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-end px-4">
                  <div className="h-6 w-2 bg-gray-700 rounded-sm shadow-md"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-4">
                  <div className={`h-6 bg-gray-800 rounded-sm shadow-md transition-all duration-300`} style={{ width: `${100 - frontBrakes.wearPercentage}%` }}></div>
                </div>
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
                getBrakeStatus(rearBrakes.wearPercentage).bgColor} ${
                getBrakeStatus(rearBrakes.wearPercentage).color} border border-white/20 bg-white/90 shadow-md`}>
                {getBrakeStatus(rearBrakes.wearPercentage).icon}
                <span className="ml-1">{getBrakeStatus(rearBrakes.wearPercentage).label}</span>
              </div>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">Brake Pad Wear</span>
                  <span className="font-bold text-blue-600">{rearBrakes.wearPercentage}% Worn</span>
                </div>
                <Slider
                  value={[rearBrakes.wearPercentage]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={handleRearBrakeChange}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-green-500">New</span>
                  <span className="text-amber-500">Fair</span>
                  <span className="text-red-500">Replace</span>
                </div>
              </div>

              {/* Brake pad visualization */}
              <div className="relative h-12 bg-gray-100 rounded-md overflow-hidden shadow-inner mt-4">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-md ${
                    rearBrakes.wearPercentage < 30 
                      ? "bg-gradient-to-r from-green-400 to-green-500" 
                      : rearBrakes.wearPercentage < 70 
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                  } transition-all duration-300 ease-in-out`}
                  style={{ width: `${rearBrakes.wearPercentage}%` }}
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-end px-4">
                  <div className="h-6 w-2 bg-gray-700 rounded-sm shadow-md"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-4">
                  <div className={`h-6 bg-gray-800 rounded-sm shadow-md transition-all duration-300`} style={{ width: `${100 - rearBrakes.wearPercentage}%` }}></div>
                </div>
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
