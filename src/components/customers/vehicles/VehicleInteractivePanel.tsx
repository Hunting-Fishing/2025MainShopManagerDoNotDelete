
import React from 'react';
import { Card } from "@/components/ui/card";
import { VehicleBodyStyle, VEHICLE_BODY_STYLES } from '@/types/vehicleBodyStyles';
import { DamageArea } from '@/services/vehicleInspectionService';

interface VehicleInteractivePanelProps {
  vehicleType: VehicleBodyStyle;
  damageAreas?: DamageArea[];
  onAreaClick?: (areaId: string) => void;
}

const VehicleInteractivePanel: React.FC<VehicleInteractivePanelProps> = ({
  vehicleType,
  damageAreas = [],
  onAreaClick
}) => {
  // Convert damageAreas to a map for quick lookup
  const damageMap = damageAreas.reduce((map, area) => {
    // Set to true if area exists (we assume damaged areas are included in this list)
    map[area.panelId] = true;
    return map;
  }, {} as Record<string, boolean>);
  
  // Default to sedan if requested type isn't available
  const vehicleConfig = VEHICLE_BODY_STYLES[vehicleType] || VEHICLE_BODY_STYLES[VehicleBodyStyle.Sedan];
  
  const handleAreaClick = (areaId: string) => {
    if (onAreaClick) {
      onAreaClick(areaId);
    }
  };
  
  return (
    <Card className="overflow-hidden border transition-all rounded-xl p-0">
      <div className="relative w-full">
        <img 
          src={vehicleConfig.imagePath}
          alt={vehicleConfig.altText}
          className="w-full h-auto"
        />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          {vehicleConfig.panels.map(panel => {
            const isDamaged = damageMap[panel.id];
            return (
              <div
                key={panel.id}
                onClick={() => handleAreaClick(panel.id)}
                className={`absolute cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isDamaged 
                    ? 'bg-amber-500/70 hover:bg-amber-500 border-amber-600' 
                    : 'bg-green-500/60 hover:bg-green-500 border-green-600'}
                  border-2 shadow-md hover:shadow-lg transform hover:scale-110`}
                style={panel.coordinates ? getCoordinates(panel.coordinates) : getDefaultPosition(panel.id)}
              >
                {isDamaged ? 
                  <span className="text-white font-bold text-xs">!</span> :
                  <span className="text-white font-bold text-xs">✓</span>
                }
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {panel.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// Helper function to parse coordinates string (if provided)
function getCoordinates(coords: string) {
  try {
    const [top, left] = coords.split(',').map(n => parseInt(n.trim()));
    return { top: `${top}%`, left: `${left}%` };
  } catch (e) {
    return {};
  }
}

// Default positions for common vehicle parts
function getDefaultPosition(areaId: string) {
  // Position mapping - these values are percentages
  const positions: Record<string, { top: string, left: string }> = {
    'hood': { top: '20%', left: '50%' },
    'front_bumper': { top: '30%', left: '50%' },
    'windshield': { top: '15%', left: '50%' },
    'roof': { top: '10%', left: '50%' },
    'trunk': { top: '10%', left: '80%' },
    'rear_bumper': { top: '30%', left: '80%' },
    'front_left_door': { top: '20%', left: '30%' },
    'rear_left_door': { top: '20%', left: '20%' },
    'front_right_door': { top: '20%', left: '70%' },
    'rear_right_door': { top: '20%', left: '80%' },
    'front_left_fender': { top: '25%', left: '20%' },
    'front_right_fender': { top: '25%', left: '80%' },
    'truck_bed': { top: '15%', left: '90%' },
    'front': { top: '30%', left: '10%' },
    'rear': { top: '30%', left: '90%' },
    'driver_side': { top: '40%', left: '20%' },
    'passenger_side': { top: '40%', left: '80%' },
    'left_front_door': { top: '20%', left: '30%' },
    'right_front_door': { top: '20%', left: '70%' },
    'left_rear_door': { top: '20%', left: '20%' },
    'right_rear_door': { top: '20%', left: '80%' },
    'left_front_fender': { top: '25%', left: '20%' },
    'right_front_fender': { top: '25%', left: '80%' },
  };
  
  return positions[areaId] || { top: '50%', left: '50%' };
}

export default VehicleInteractivePanel;
