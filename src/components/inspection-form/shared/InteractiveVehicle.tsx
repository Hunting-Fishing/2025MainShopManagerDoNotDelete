
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, X } from 'lucide-react';
import { VehicleBodyStyle, VEHICLE_BODY_STYLES } from '@/types/vehicleBodyStyles';

interface DamageArea {
  id: string;
  name: string;
  isDamaged: boolean;
  damageType: string | null;
  notes: string;
}

interface InteractiveVehicleProps {
  vehicleType?: VehicleBodyStyle;
  onDamageUpdate?: (damages: DamageArea[]) => void;
}

const InteractiveVehicle: React.FC<InteractiveVehicleProps> = ({ 
  vehicleType = 'sedan', 
  onDamageUpdate 
}) => {
  // Use vehicle type to get the correct configuration
  const bodyStyle = VEHICLE_BODY_STYLES[vehicleType] || VEHICLE_BODY_STYLES.unknown;
  
  // Initialize vehicle areas based on the panels for this vehicle type
  const [vehicleAreas, setVehicleAreas] = useState<DamageArea[]>(
    bodyStyle.panels.map(panel => ({
      id: panel.id,
      name: panel.name,
      isDamaged: false,
      damageType: null,
      notes: ''
    }))
  );

  const [selectedArea, setSelectedArea] = useState<DamageArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const damageTypes = [
    { id: 'scratch', label: 'Scratch' },
    { id: 'dent', label: 'Dent' },
    { id: 'crack', label: 'Crack' },
    { id: 'missing', label: 'Missing Part' },
    { id: 'rust', label: 'Rust' },
  ];

  const handleAreaClick = (areaId: string) => {
    const area = vehicleAreas.find(a => a.id === areaId) || null;
    setSelectedArea(area);
    setIsDialogOpen(true);
  };

  const handleDamageUpdate = (damageType: string | null, notes: string) => {
    if (!selectedArea) return;
    
    const updatedAreas = vehicleAreas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          isDamaged: !!damageType,
          damageType,
          notes
        };
      }
      return area;
    });
    
    setVehicleAreas(updatedAreas);
    setIsDialogOpen(false);
    
    if (onDamageUpdate) {
      onDamageUpdate(updatedAreas);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedArea(null);
  };

  // Get panel status - whether it's damaged or not
  const getPanelStatus = (panelId: string) => {
    const area = vehicleAreas.find(a => a.id === panelId);
    return {
      isDamaged: area?.isDamaged || false,
      damageType: area?.damageType || null
    };
  };

  return (
    <div className="w-full">
      <div className="relative w-full max-w-[600px] mx-auto">
        {/* Vehicle Diagram Container */}
        <div className="relative aspect-[1/1] border rounded-lg overflow-hidden bg-gray-50">
          {/* Vehicle image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={bodyStyle.imagePath} 
              alt={bodyStyle.altText}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Clickable overlay areas */}
          <div className="absolute inset-0">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 600 600" 
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Front section */}
              <g className="vehicle-front">
                {/* Hood */}
                <polygon 
                  points="200,150 400,150 350,250 250,250" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('hood').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('hood')}
                />
                
                {/* Front bumper */}
                <rect 
                  x="200" 
                  y="120" 
                  width="200" 
                  height="30" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('front_bumper').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('front_bumper')}
                />
              </g>

              {/* Left side */}
              <g className="vehicle-left-side">
                {/* Left front fender */}
                <polygon 
                  points="200,150 250,250 200,250 150,180" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('front_left_fender').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('front_left_fender')}
                />
                
                {/* Left front door */}
                <polygon 
                  points="200,250 250,250 250,350 200,350" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('front_left_door').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('front_left_door')}
                />
                
                {/* Left rear door/panel */}
                <polygon 
                  points="200,350 250,350 250,450 150,450" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('rear_left_panel').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('rear_left_panel')}
                />
              </g>

              {/* Right side */}
              <g className="vehicle-right-side">
                {/* Right front fender */}
                <polygon 
                  points="400,150 350,250 400,250 450,180" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('front_right_fender').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('front_right_fender')}
                />
                
                {/* Right front door */}
                <polygon 
                  points="350,250 400,250 400,350 350,350" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('front_right_door').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('front_right_door')}
                />
                
                {/* Right rear door/panel */}
                <polygon 
                  points="350,350 400,350 450,450 350,450" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('rear_right_panel').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('rear_right_panel')}
                />
              </g>

              {/* Roof */}
              <rect 
                x="250" 
                y="250" 
                width="100" 
                height="100" 
                className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                  getPanelStatus('roof').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                }`}
                onClick={() => handleAreaClick('roof')}
              />

              {/* Rear section */}
              <g className="vehicle-rear">
                {/* Trunk/Hatch */}
                <polygon 
                  points="250,450 350,450 400,500 200,500" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('trunk').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('trunk')}
                />
                
                {/* Rear bumper */}
                <rect 
                  x="200" 
                  y="500" 
                  width="200" 
                  height="30" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('rear_bumper').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                  }`}
                  onClick={() => handleAreaClick('rear_bumper')}
                />
              </g>

              {/* Vehicle specific panels for truck */}
              {vehicleType === 'truck' && (
                <g className="vehicle-truck-specific">
                  <rect 
                    x="250" 
                    y="350" 
                    width="100" 
                    height="100" 
                    className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                      getPanelStatus('truck_bed').isDamaged ? 'fill-amber-500' : 'fill-blue-200 hover:fill-blue-300'
                    }`}
                    onClick={() => handleAreaClick('truck_bed')}
                  />
                </g>
              )}
              
              {/* Glass areas */}
              <g className="vehicle-glass">
                {/* Windshield */}
                <polygon 
                  points="250,250 350,250 325,200 275,200" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('windshield').isDamaged ? 'fill-amber-500' : 'fill-green-200 hover:fill-green-300'
                  }`}
                  onClick={() => handleAreaClick('windshield')}
                />
                
                {/* Rear window */}
                <polygon 
                  points="250,350 350,350 325,400 275,400" 
                  className={`opacity-50 cursor-pointer hover:opacity-70 transition-opacity ${
                    getPanelStatus('rear_window').isDamaged ? 'fill-amber-500' : 'fill-green-200 hover:fill-green-300'
                  }`}
                  onClick={() => handleAreaClick('rear_window')}
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 border border-amber-600"></div>
            <span className="text-sm">Damaged Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-300"></div>
            <span className="text-sm">Body Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-300"></div>
            <span className="text-sm">Glass</span>
          </div>
        </div>
        
        {/* Damage list */}
        {vehicleAreas.some(area => area.isDamaged) && (
          <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="font-medium mb-2">Damage Report:</h4>
            <ul className="divide-y">
              {vehicleAreas
                .filter(area => area.isDamaged)
                .map(area => (
                  <li key={area.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{area.name}</span>
                      <p className="text-sm text-muted-foreground">{area.damageType} {area.notes ? `- ${area.notes}` : ''}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAreaClick(area.id)}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </div>

      {/* Damage Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between">
              <span>{selectedArea?.name || 'Vehicle Area'}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeDialog}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Damage Type</Label>
              <RadioGroup 
                value={selectedArea?.damageType || ""} 
                onValueChange={(value) => selectedArea && handleDamageUpdate(value || null, selectedArea.notes || "")}
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="none" />
                  <Label htmlFor="none" className="cursor-pointer">None</Label>
                </div>
                
                {damageTypes.map(type => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.id} id={type.id} />
                    <Label htmlFor={type.id} className="cursor-pointer">{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Add details about the damage..." 
                value={selectedArea?.notes || ""}
                onChange={(e) => {
                  if (selectedArea) {
                    handleDamageUpdate(
                      selectedArea.damageType, 
                      e.target.value
                    );
                  }
                }}
                className="min-h-24"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveVehicle;
