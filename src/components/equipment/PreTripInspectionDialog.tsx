import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEquipmentInspections } from '@/hooks/useEquipmentInspections';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PreTripInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId: string;
  equipmentName: string;
  readingType: 'hours' | 'kilometers' | 'miles';
}

export function PreTripInspectionDialog({
  open,
  onOpenChange,
  equipmentId,
  equipmentName,
  readingType,
}: PreTripInspectionDialogProps) {
  const { createInspection, loading } = useEquipmentInspections(equipmentId);
  const [currentReading, setCurrentReading] = useState('');
  
  // Inspection items
  const [fluidLevelsOk, setFluidLevelsOk] = useState(true);
  const [fluidNotes, setFluidNotes] = useState('');
  const [visualDamageOk, setVisualDamageOk] = useState(true);
  const [visualDamageNotes, setVisualDamageNotes] = useState('');
  const [safetyEquipmentOk, setSafetyEquipmentOk] = useState(true);
  const [safetyEquipmentNotes, setSafetyEquipmentNotes] = useState('');
  const [operationalOk, setOperationalOk] = useState(true);
  const [operationalNotes, setOperationalNotes] = useState('');
  
  const [requiresMaintenance, setRequiresMaintenance] = useState(false);
  const [urgentRepair, setUrgentRepair] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allChecksPass = fluidLevelsOk && visualDamageOk && safetyEquipmentOk && operationalOk;
    const hasNotes = fluidNotes || visualDamageNotes || safetyEquipmentNotes || operationalNotes || generalNotes;
    
    let overallStatus: 'pass' | 'pass_with_notes' | 'fail';
    if (!allChecksPass || urgentRepair) {
      overallStatus = 'fail';
    } else if (hasNotes || requiresMaintenance) {
      overallStatus = 'pass_with_notes';
    } else {
      overallStatus = 'pass';
    }

    try {
      await createInspection({
        equipment_id: equipmentId,
        current_reading: parseFloat(currentReading),
        reading_type: readingType,
        fluid_levels_ok: fluidLevelsOk,
        fluid_notes: fluidNotes || null,
        visual_damage_ok: visualDamageOk,
        visual_damage_notes: visualDamageNotes || null,
        safety_equipment_ok: safetyEquipmentOk,
        safety_equipment_notes: safetyEquipmentNotes || null,
        operational_ok: operationalOk,
        operational_notes: operationalNotes || null,
        overall_status: overallStatus,
        requires_maintenance: requiresMaintenance,
        urgent_repair: urgentRepair,
        parts_needed: [],
        general_notes: generalNotes || null,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to submit inspection:', error);
    }
  };

  const resetForm = () => {
    setCurrentReading('');
    setFluidLevelsOk(true);
    setFluidNotes('');
    setVisualDamageOk(true);
    setVisualDamageNotes('');
    setSafetyEquipmentOk(true);
    setSafetyEquipmentNotes('');
    setOperationalOk(true);
    setOperationalNotes('');
    setRequiresMaintenance(false);
    setUrgentRepair(false);
    setGeneralNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pre-Trip Inspection - {equipmentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reading">Current Reading ({readingType})</Label>
            <Input
              id="reading"
              type="number"
              step="0.01"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              required
              placeholder={`Enter current ${readingType}`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Inspection Checklist</h3>
            
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {fluidLevelsOk ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Label htmlFor="fluids">Fluid Levels</Label>
                </div>
                <Switch
                  id="fluids"
                  checked={fluidLevelsOk}
                  onCheckedChange={setFluidLevelsOk}
                />
              </div>
              {!fluidLevelsOk && (
                <Textarea
                  placeholder="Describe fluid level issues..."
                  value={fluidNotes}
                  onChange={(e) => setFluidNotes(e.target.value)}
                  className="mt-2"
                />
              )}
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {visualDamageOk ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Label htmlFor="visual">Visual Inspection (No Damage)</Label>
                </div>
                <Switch
                  id="visual"
                  checked={visualDamageOk}
                  onCheckedChange={setVisualDamageOk}
                />
              </div>
              {!visualDamageOk && (
                <Textarea
                  placeholder="Describe damage found..."
                  value={visualDamageNotes}
                  onChange={(e) => setVisualDamageNotes(e.target.value)}
                  className="mt-2"
                />
              )}
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {safetyEquipmentOk ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Label htmlFor="safety">Safety Equipment</Label>
                </div>
                <Switch
                  id="safety"
                  checked={safetyEquipmentOk}
                  onCheckedChange={setSafetyEquipmentOk}
                />
              </div>
              {!safetyEquipmentOk && (
                <Textarea
                  placeholder="Describe safety equipment issues..."
                  value={safetyEquipmentNotes}
                  onChange={(e) => setSafetyEquipmentNotes(e.target.value)}
                  className="mt-2"
                />
              )}
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {operationalOk ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Label htmlFor="operational">Operational Check</Label>
                </div>
                <Switch
                  id="operational"
                  checked={operationalOk}
                  onCheckedChange={setOperationalOk}
                />
              </div>
              {!operationalOk && (
                <Textarea
                  placeholder="Describe operational issues..."
                  value={operationalNotes}
                  onChange={(e) => setOperationalNotes(e.target.value)}
                  className="mt-2"
                />
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">Requires Maintenance</Label>
              <Switch
                id="maintenance"
                checked={requiresMaintenance}
                onCheckedChange={setRequiresMaintenance}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <Label htmlFor="urgent">Urgent Repair Needed</Label>
              </div>
              <Switch
                id="urgent"
                checked={urgentRepair}
                onCheckedChange={setUrgentRepair}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">General Notes</Label>
            <Textarea
              id="notes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Any additional observations..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Complete Inspection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
