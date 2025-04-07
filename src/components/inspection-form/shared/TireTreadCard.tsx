
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Check, AlertCircle } from "lucide-react";

interface TireTreadCardProps {
  position: string;
}

const TireTreadCard: React.FC<TireTreadCardProps> = ({ position }) => {
  const [treadDepth, setTreadDepth] = useState<number[]>([6]);
  
  const getTreadStatus = (depth: number) => {
    if (depth >= 6) {
      return { 
        status: "Good", 
        color: "text-green-600", 
        bgColor: "bg-green-100 border-green-200",
        icon: <Check className="h-5 w-5" />
      };
    } else if (depth >= 3) {
      return { 
        status: "Fair", 
        color: "text-amber-600", 
        bgColor: "bg-amber-100 border-amber-200",
        icon: <AlertTriangle className="h-5 w-5" />
      };
    } else {
      return { 
        status: "Replace", 
        color: "text-red-600", 
        bgColor: "bg-red-100 border-red-200",
        icon: <AlertCircle className="h-5 w-5" />
      };
    }
  };
  
  const treadStatus = getTreadStatus(treadDepth[0]);
  
  return (
    <div className={`border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${treadStatus.bgColor}`}>
      <div className="flex justify-between items-center mb-3">
        <Label className="text-lg font-medium">{position}</Label>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-sm border ${treadStatus.color}`}>
          {treadStatus.icon}
          <span className="font-medium">{treadStatus.status}</span>
        </div>
      </div>
      <div className="space-y-5">
        <div className="pt-2">
          <Slider
            value={treadDepth}
            min={0}
            max={10}
            step={0.5}
            onValueChange={setTreadDepth}
          />
          <div className="flex justify-between text-xs mt-2">
            <span className="text-red-500 font-medium">0mm</span>
            <span className="text-amber-500 font-medium">4mm</span>
            <span className="text-green-500 font-medium">8mm+</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-white rounded-lg px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Tread Depth</span>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {treadDepth[0]}mm
          </div>
        </div>
        
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              treadDepth[0] >= 6 
                ? "bg-gradient-to-r from-green-400 to-green-500" 
                : treadDepth[0] >= 3 
                  ? "bg-gradient-to-r from-amber-400 to-amber-500" 
                  : "bg-gradient-to-r from-red-400 to-red-500"
            } transition-all duration-300 ease-in-out`}
            style={{ width: `${(treadDepth[0] / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TireTreadCard;
