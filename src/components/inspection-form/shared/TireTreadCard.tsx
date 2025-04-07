
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Check } from "lucide-react";

interface TireTreadCardProps {
  position: string;
}

const TireTreadCard: React.FC<TireTreadCardProps> = ({ position }) => {
  const [treadDepth, setTreadDepth] = useState<number[]>([6]);
  
  const getTreadStatus = (depth: number) => {
    if (depth >= 6) {
      return { status: "Good", color: "text-green-600", icon: <Check className="h-4 w-4" /> };
    } else if (depth >= 3) {
      return { status: "Fair", color: "text-amber-600", icon: <AlertTriangle className="h-4 w-4" /> };
    } else {
      return { status: "Replace", color: "text-red-600", icon: <AlertTriangle className="h-4 w-4" /> };
    }
  };
  
  const treadStatus = getTreadStatus(treadDepth[0]);
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <Label className="text-sm font-medium">{position}</Label>
        <div className={`flex items-center ${treadStatus.color}`}>
          {treadStatus.icon}
          <span className="ml-1 text-sm font-medium">{treadStatus.status}</span>
        </div>
      </div>
      <div className="space-y-4">
        <Slider
          value={treadDepth}
          min={0}
          max={10}
          step={0.5}
          onValueChange={setTreadDepth}
          className="my-4"
        />
        <div className="flex justify-between text-xs">
          <span className="text-red-500">0mm</span>
          <span className="text-amber-500">4mm</span>
          <span className="text-green-500">8mm+</span>
        </div>
        <div className="flex justify-between items-center bg-muted/30 rounded-sm px-3 py-2">
          <span className="text-sm">Tread Depth</span>
          <span className="text-sm font-medium">{treadDepth[0]}mm</span>
        </div>
      </div>
    </div>
  );
};

export default TireTreadCard;
