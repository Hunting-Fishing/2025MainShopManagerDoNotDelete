
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info, Camera, X } from "lucide-react";
import { VehicleBodyStyle, VEHICLE_BODY_STYLES } from "@/types/vehicleBodyStyles";
import InteractiveVehicle from './shared/InteractiveVehicle';
import { DamageArea } from '@/services/vehicleInspectionService';

interface ExteriorCheckTabProps {
  vehicleBodyStyle: VehicleBodyStyle;
  damageAreas?: DamageArea[];
  onDamageAreasChange: (damageAreas: DamageArea[]) => void;
}

const DAMAGE_TYPES = [
  { value: 'scratch', label: 'Scratch', color: 'bg-yellow-400' },
  { value: 'dent', label: 'Dent', color: 'bg-orange-500' },
  { value: 'crack', label: 'Crack', color: 'bg-red-500' },
  { value: 'rust', label: 'Rust', color: 'bg-amber-800' },
  { value: 'missing', label: 'Missing Part', color: 'bg-purple-500' }
];

const ExteriorCheckTab: React.FC<ExteriorCheckTabProps> = ({ 
  vehicleBodyStyle,
  damageAreas = [], 
  onDamageAreasChange
}) => {
  const [selectedDamageType, setSelectedDamageType] = useState<string>('scratch');
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const handlePanelClick = (panelId: string) => {
    setSelectedPanelId(panelId);
  };

  const handleAddDamage = () => {
    if (!selectedPanelId) return;
    
    // Find the panel to get its name
    const panelConfig = VEHICLE_BODY_STYLES[vehicleBodyStyle]?.panels.find(
      panel => panel.id === selectedPanelId
    );
    
    if (!panelConfig) return;

    const newDamage: DamageArea = {
      id: `damage-${Date.now()}`,
      panelId: selectedPanelId,
      panelName: panelConfig.name,
      damageType: selectedDamageType,
      notes: notes,
      timestamp: new Date().toISOString()
    };

    // Add to the list of damages
    const updatedDamages = [...damageAreas, newDamage];
    onDamageAreasChange(updatedDamages);
    
    // Reset form
    setNotes('');
    setSelectedPanelId(null);
  };

  const handleRemoveDamage = (damageId: string) => {
    const updatedDamages = damageAreas.filter(damage => damage.id !== damageId);
    onDamageAreasChange(updatedDamages);
  };

  const getColor = (damageType: string) => {
    return DAMAGE_TYPES.find(type => type.value === damageType)?.color || 'bg-gray-500';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:row-span-2">
        <CardHeader>
          <CardTitle className="text-xl">Vehicle Exterior</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveVehicle 
            bodyStyle={vehicleBodyStyle} 
            selectedPanelId={selectedPanelId}
            onPanelClick={handlePanelClick}
            damageAreas={damageAreas}
          />

          {selectedPanelId && (
            <div className="mt-6 p-4 border rounded-lg bg-slate-50">
              <h3 className="font-medium mb-2">
                {VEHICLE_BODY_STYLES[vehicleBodyStyle]?.panels.find(
                  panel => panel.id === selectedPanelId
                )?.name || 'Selected Panel'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Damage Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {DAMAGE_TYPES.map(type => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={selectedDamageType === type.value ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setSelectedDamageType(type.value)}
                      >
                        <div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="damage-notes">Notes (Optional)</Label>
                  <Textarea 
                    id="damage-notes"
                    placeholder="Describe the damage..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    className="flex-1"
                    onClick={handleAddDamage}
                  >
                    Add Damage
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedPanelId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {!selectedPanelId && (
            <div className="flex items-center justify-center p-4 border rounded-lg border-dashed mt-6">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Click on a vehicle panel to report damage</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Documented Damage</CardTitle>
        </CardHeader>
        <CardContent>
          {damageAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 border rounded-lg border-dashed">
              <Camera className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No damage reported yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click on a vehicle panel to report damage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {damageAreas.map(damage => (
                <div 
                  key={damage.id} 
                  className="p-3 border rounded-lg flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getColor(damage.damageType)} mr-2`} />
                      <h4 className="font-medium">{damage.panelName}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {damage.damageType}
                    </p>
                    {damage.notes && (
                      <p className="text-sm mt-2">{damage.notes}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveDamage(damage.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-6 border rounded-lg border-dashed">
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No photos uploaded</p>
            <Button className="mt-4" variant="outline">
              <Camera className="h-4 w-4 mr-2" /> Add Photos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExteriorCheckTab;
