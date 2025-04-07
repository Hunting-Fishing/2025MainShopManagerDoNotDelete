
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, X } from 'lucide-react';

interface DamageArea {
  id: string;
  name: string;
  isDamaged: boolean;
  damageType: string | null;
  notes: string;
}

interface InteractiveVehicleProps {
  onDamageUpdate?: (damages: DamageArea[]) => void;
}

const InteractiveVehicle: React.FC<InteractiveVehicleProps> = ({ onDamageUpdate }) => {
  const [vehicleAreas, setVehicleAreas] = useState<DamageArea[]>([
    { id: 'front_bumper', name: 'Front Bumper', isDamaged: false, damageType: null, notes: '' },
    { id: 'hood', name: 'Hood', isDamaged: false, damageType: null, notes: '' },
    { id: 'front_left_panel', name: 'Front Left Panel', isDamaged: false, damageType: null, notes: '' },
    { id: 'driver_door', name: 'Driver Door', isDamaged: false, damageType: null, notes: '' },
    { id: 'rear_left_panel', name: 'Rear Left Panel', isDamaged: false, damageType: null, notes: '' },
    { id: 'roof', name: 'Roof', isDamaged: false, damageType: null, notes: '' },
    { id: 'trunk', name: 'Trunk', isDamaged: false, damageType: null, notes: '' },
    { id: 'rear_bumper', name: 'Rear Bumper', isDamaged: false, damageType: null, notes: '' },
    { id: 'rear_right_panel', name: 'Rear Right Panel', isDamaged: false, damageType: null, notes: '' },
    { id: 'passenger_door', name: 'Passenger Door', isDamaged: false, damageType: null, notes: '' },
    { id: 'front_right_panel', name: 'Front Right Panel', isDamaged: false, damageType: null, notes: '' },
    { id: 'windshield', name: 'Windshield', isDamaged: false, damageType: null, notes: '' },
    { id: 'rear_window', name: 'Rear Window', isDamaged: false, damageType: null, notes: '' },
  ]);

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

  return (
    <div className="w-full">
      <div className="relative w-full max-w-[600px] mx-auto">
        {/* Vehicle SVG Container */}
        <div className="relative aspect-[4/3] border rounded-lg overflow-hidden bg-gray-50">
          {/* Top view */}
          <svg className="absolute top-0 left-0 right-0 w-full h-1/3" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet">
            <path 
              d="M75,80 C75,50 150,30 225,80" 
              stroke="#000" 
              strokeWidth="1" 
              fill="none"
            />
            <path 
              d="M75,80 C100,90 200,90 225,80" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('roof')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'roof')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <path 
              d="M75,80 L100,90 L75,95 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#e0e0e0"
              onClick={() => handleAreaClick('windshield')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'windshield')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <path 
              d="M225,80 L200,90 L225,95 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#e0e0e0"
              onClick={() => handleAreaClick('rear_window')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'rear_window')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <text x="150" y="20" textAnchor="middle" className="text-[8px] font-bold">TOP VIEW</text>
          </svg>

          {/* Front view */}
          <svg className="absolute top-1/3 left-0 w-1/3 h-1/3" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <rect 
              x="20" 
              y="20" 
              width="60" 
              height="60" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('front_bumper')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'front_bumper')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <text x="50" y="95" textAnchor="middle" className="text-[8px] font-bold">FRONT VIEW</text>
          </svg>

          {/* Side view */}
          <svg className="absolute top-1/3 left-1/3 right-0 h-1/3" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
            <path 
              d="M10,50 L40,30 L160,30 L190,50 L190,70 L10,70 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="none"
            />
            <path 
              d="M10,50 L10,70 L40,70 L40,50 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('front_left_panel')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'front_left_panel')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <path 
              d="M40,30 L40,70 L80,70 L80,30 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('hood')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'hood')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <path 
              d="M80,30 L80,70 L120,70 L120,30 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('driver_door')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'driver_door')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <path 
              d="M120,30 L120,70 L160,70 L160,30 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('rear_left_panel')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'rear_left_panel')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <path 
              d="M160,30 L160,70 L190,70 L190,50 Z" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('trunk')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'trunk')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <circle cx="50" cy="70" r="10" stroke="#000" strokeWidth="1" fill="#d0d0d0" />
            <circle cx="150" cy="70" r="10" stroke="#000" strokeWidth="1" fill="#d0d0d0" />
            <text x="100" y="95" textAnchor="middle" className="text-[8px] font-bold">SIDE VIEW</text>
          </svg>

          {/* Bottom view mirrors top view */}
          <svg className="absolute bottom-0 left-0 right-0 h-1/3" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet">
            <path 
              d="M75,20 C75,50 150,70 225,20" 
              stroke="#000" 
              strokeWidth="1" 
              fill="none"
            />
            <path 
              d="M75,20 C100,10 200,10 225,20" 
              stroke="#000" 
              strokeWidth="1" 
              fill="#f0f0f0"
              onClick={() => handleAreaClick('rear_bumper')}
              className={`cursor-pointer transition-colors hover:fill-blue-200 ${vehicleAreas.find(a => a.id === 'rear_bumper')?.isDamaged ? 'fill-amber-200' : ''}`}
            />
            <text x="150" y="95" textAnchor="middle" className="text-[8px] font-bold">BOTTOM VIEW</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-200 border border-amber-300"></div>
            <span className="text-sm">Damaged Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-300"></div>
            <span className="text-sm">Hover Area</span>
          </div>
        </div>
        
        {/* Damage list */}
        {vehicleAreas.some(area => area.isDamaged) && (
          <div className="mt-6 border rounded-lg p-4">
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
                onValueChange={(value) => handleDamageUpdate(value || null, selectedArea?.notes || "")}
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
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveVehicle;
