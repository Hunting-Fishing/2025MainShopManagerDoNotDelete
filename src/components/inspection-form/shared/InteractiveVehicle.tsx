
import React from 'react';
import { VehicleBodyStyle, VEHICLE_BODY_STYLES } from '@/types/vehicleBodyStyles';
import { DamageArea } from '@/services/vehicleInspectionService';

interface InteractiveVehicleProps {
  bodyStyle: VehicleBodyStyle;
  selectedPanelId: string | null;
  onPanelClick: (panelId: string) => void;
  damageAreas?: DamageArea[];
}

const InteractiveVehicle: React.FC<InteractiveVehicleProps> = ({
  bodyStyle,
  selectedPanelId,
  onPanelClick,
  damageAreas = []
}) => {
  const vehicleConfig = VEHICLE_BODY_STYLES[bodyStyle];
  
  if (!vehicleConfig) {
    return (
      <div className="text-center p-4 border rounded-lg">
        Vehicle configuration not found for this body style
      </div>
    );
  }

  // Simple basic color map for damage types
  const getDamageColor = (damageType: string): string => {
    switch (damageType) {
      case 'scratch': return '#FBBF24'; // yellow
      case 'dent': return '#F97316'; // orange
      case 'crack': return '#EF4444'; // red  
      case 'rust': return '#92400E'; // amber
      case 'missing': return '#A855F7'; // purple
      default: return '#6B7280'; // gray
    }
  };

  // Check if a panel has damage
  const getPanelDamage = (panelId: string): DamageArea | undefined => {
    return damageAreas.find(damage => damage.panelId === panelId);
  };

  return (
    <div className="relative w-full flex justify-center">
      <div className="relative w-full max-w-md">
        <img 
          src={vehicleConfig.imagePath} 
          alt={vehicleConfig.altText} 
          className="w-full h-auto"
        />
        
        <div className="absolute inset-0">
          {vehicleConfig.panels.map(panel => {
            const damage = getPanelDamage(panel.id);
            const isSelected = selectedPanelId === panel.id;
            
            // Simple hotspot representation
            return (
              <button 
                key={panel.id}
                type="button"
                onClick={() => onPanelClick(panel.id)}
                className={`
                  absolute rounded-full w-6 h-6 transform -translate-x-1/2 -translate-y-1/2
                  flex items-center justify-center
                  transition-all duration-200
                  ${isSelected ? 'scale-125 z-10' : ''}
                  ${damage ? 'border-2' : 'border'}
                `}
                style={{
                  top: panel.coordinates ? `${panel.coordinates.split(',')[1]}%` : '50%',
                  left: panel.coordinates ? `${panel.coordinates.split(',')[0]}%` : '50%',
                  backgroundColor: damage ? getDamageColor(damage.damageType) : isSelected ? '#3B82F6' : '#CBD5E1',
                  borderColor: isSelected ? '#2563EB' : damage ? getDamageColor(damage.damageType) : '#94A3B8',
                  opacity: damage ? 0.8 : 0.6,
                }}
                title={panel.name}
              >
                <span className="text-xs text-white font-bold">
                  {damage ? '!' : ''}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Legend for the panels */}
        <div className="mt-4 grid grid-cols-2 gap-1 text-xs">
          {vehicleConfig.panels.map(panel => (
            <div 
              key={panel.id} 
              className={`px-2 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors
                ${selectedPanelId === panel.id ? 'bg-slate-100 font-medium' : ''}
              `}
              onClick={() => onPanelClick(panel.id)}
            >
              {panel.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveVehicle;
