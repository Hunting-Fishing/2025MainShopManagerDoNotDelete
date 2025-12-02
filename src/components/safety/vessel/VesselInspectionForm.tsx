import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Ship, Anchor, Flame, Settings, Clock, Save, Loader2, User } from 'lucide-react';
import { VesselSelector } from './VesselSelector';
import { VesselEquipmentTree } from './VesselEquipmentTree';
import { VesselInspectionItem } from './VesselInspectionItem';
import { EquipmentServiceIntervals } from './EquipmentServiceIntervals';
import { useVesselInspection, InspectionItemStatus, VesselEquipment } from '@/hooks/useVesselInspection';
import { toast } from '@/hooks/use-toast';

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  vessel: <Ship className="h-5 w-5" />,
  outboard: <Anchor className="h-5 w-5" />,
  inboard: <Settings className="h-5 w-5" />,
  fire_extinguisher: <Flame className="h-5 w-5" />,
  generator: <Settings className="h-5 w-5" />,
  life_raft: <Ship className="h-5 w-5" />,
};

export function VesselInspectionForm() {
  const {
    vessels,
    vesselsLoading,
    selectedVesselId,
    setSelectedVesselId,
    childEquipment,
    childEquipmentLoading,
    templates,
    getTemplatesForType,
    lastInspection,
    createInspection,
    isSubmitting
  } = useVesselInspection();

  const [inspectorName, setInspectorName] = useState('');
  const [currentHours, setCurrentHours] = useState<string>('');
  const [safeToOperate, setSafeToOperate] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');
  const [inspectionItems, setInspectionItems] = useState<Map<string, InspectionItemStatus>>(new Map());

  const selectedVessel = vessels?.find(v => v.id === selectedVesselId);

  // Initialize inspection items when vessel or templates change
  useEffect(() => {
    if (!selectedVesselId || !templates) return;

    const items = new Map<string, InspectionItemStatus>();

    // Add vessel inspection items
    const vesselTemplates = getTemplatesForType('vessel');
    vesselTemplates.forEach(template => {
      const key = `vessel-${template.item_key}`;
      items.set(key, {
        templateId: template.id,
        equipmentId: selectedVesselId,
        itemKey: template.item_key,
        itemName: template.item_name,
        category: template.category,
        status: null,
        notes: ''
      });
    });

    // Add child equipment inspection items
    childEquipment?.forEach(equipment => {
      const equipmentTemplates = getTemplatesForType(equipment.equipment_type || '');
      equipmentTemplates.forEach(template => {
        const key = `${equipment.id}-${template.item_key}`;
        items.set(key, {
          templateId: template.id,
          equipmentId: equipment.id,
          itemKey: template.item_key,
          itemName: template.item_name,
          category: template.category,
          status: null,
          notes: '',
          location: equipment.location || undefined,
          hoursAtInspection: equipment.current_hours || undefined
        });
      });
    });

    setInspectionItems(items);
  }, [selectedVesselId, templates, childEquipment, getTemplatesForType]);

  // Set current hours from vessel
  useEffect(() => {
    if (selectedVessel?.current_hours) {
      setCurrentHours(selectedVessel.current_hours.toString());
    }
  }, [selectedVessel]);

  const updateItemStatus = (key: string, status: InspectionItemStatus['status']) => {
    setInspectionItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(key);
      if (item) {
        newMap.set(key, { ...item, status });
      }
      return newMap;
    });
  };

  const updateItemNotes = (key: string, notes: string) => {
    setInspectionItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(key);
      if (item) {
        newMap.set(key, { ...item, notes });
      }
      return newMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVesselId) {
      toast({ title: 'Error', description: 'Please select a vessel', variant: 'destructive' });
      return;
    }

    if (!inspectorName.trim()) {
      toast({ title: 'Error', description: 'Please enter inspector name', variant: 'destructive' });
      return;
    }

    const items = Array.from(inspectionItems.values());
    const filledItems = items.filter(item => item.status !== null);

    if (filledItems.length === 0) {
      toast({ title: 'Error', description: 'Please complete at least one inspection item', variant: 'destructive' });
      return;
    }

    await createInspection.mutateAsync({
      vesselId: selectedVesselId,
      inspectorName,
      currentHours: currentHours ? parseFloat(currentHours) : null,
      overallStatus: 'pending',
      safeToOperate,
      generalNotes,
      items
    });

    // Reset form
    setInspectorName('');
    setGeneralNotes('');
    setSafeToOperate(false);
    setInspectionItems(new Map());
    setSelectedVesselId(null);
  };

  // Group items by equipment
  const getVesselItems = () => {
    return Array.from(inspectionItems.entries())
      .filter(([key]) => key.startsWith('vessel-'))
      .map(([key, item]) => ({ key, ...item }));
  };

  const getEquipmentItems = (equipmentId: string) => {
    return Array.from(inspectionItems.entries())
      .filter(([key]) => key.startsWith(`${equipmentId}-`))
      .map(([key, item]) => ({ key, ...item }));
  };

  // Group vessel items by category
  const groupItemsByCategory = (items: Array<{ key: string } & InspectionItemStatus>) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  };

  const vesselItems = getVesselItems();
  const vesselItemsByCategory = groupItemsByCategory(vesselItems);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vessel Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Vessel Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <VesselSelector
            vessels={vessels || []}
            selectedVesselId={selectedVesselId}
            onSelect={setSelectedVesselId}
            lastInspectionDate={lastInspection?.inspection_date}
            isLoading={vesselsLoading}
          />

          {selectedVesselId && (
            <VesselEquipmentTree
              vessel={selectedVessel || null}
              childEquipment={childEquipment || []}
              isLoading={childEquipmentLoading}
            />
          )}
        </CardContent>
      </Card>

      {selectedVesselId && (
        <>
          {/* Inspector Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Inspector Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inspectorName">Inspector Name *</Label>
                <Input
                  id="inspectorName"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentHours">Current Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentHours"
                    type="number"
                    step="0.1"
                    value={currentHours}
                    onChange={(e) => setCurrentHours(e.target.value)}
                    className="pl-10"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vessel Inspection Items */}
          {vesselItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Vessel Inspection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={Object.keys(vesselItemsByCategory)} className="space-y-2">
                  {Object.entries(vesselItemsByCategory).map(([category, items]) => (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{category}</span>
                          <Badge variant="secondary">{items.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        {items.map(item => (
                          <VesselInspectionItem
                            key={item.key}
                            itemKey={item.itemKey}
                            itemName={item.itemName}
                            category={item.category}
                            status={item.status}
                            notes={item.notes}
                            onStatusChange={(status) => updateItemStatus(item.key, status)}
                            onNotesChange={(notes) => updateItemNotes(item.key, notes)}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Child Equipment Sections */}
          {childEquipment?.map(equipment => {
            const items = getEquipmentItems(equipment.id);
            if (items.length === 0) return null;

            const itemsByCategory = groupItemsByCategory(items);
            const Icon = EQUIPMENT_ICONS[equipment.equipment_type || ''] || <Settings className="h-5 w-5" />;

            return (
              <Card key={equipment.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {Icon}
                      {equipment.name}
                      {equipment.location && (
                        <Badge variant="outline" className="font-normal">
                          {equipment.location}
                        </Badge>
                      )}
                    </div>
                    {equipment.current_hours !== null && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {equipment.current_hours}h
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Service Interval Countdown if applicable */}
                  {equipment.current_hours !== null && (
                    <div className="mb-4">
                      <EquipmentServiceIntervals
                        equipmentId={equipment.id}
                        currentHours={equipment.current_hours}
                      />
                    </div>
                  )}

                  <Accordion type="multiple" defaultValue={Object.keys(itemsByCategory)} className="space-y-2">
                    {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                      <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span>{category}</span>
                            <Badge variant="secondary">{categoryItems.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-2">
                          {categoryItems.map(item => (
                            <VesselInspectionItem
                              key={item.key}
                              itemKey={item.itemKey}
                              itemName={item.itemName}
                              category={item.category}
                              status={item.status}
                              notes={item.notes}
                              onStatusChange={(status) => updateItemStatus(item.key, status)}
                              onNotesChange={(notes) => updateItemNotes(item.key, notes)}
                            />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}

          {/* General Notes & Safe to Operate */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalNotes">General Notes</Label>
                <Textarea
                  id="generalNotes"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Any additional notes about this inspection..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="safeToOperate" className="text-base font-semibold">
                    Safe to Operate
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Confirm this vessel is safe for operation
                  </p>
                </div>
                <Switch
                  id="safeToOperate"
                  checked={safeToOperate}
                  onCheckedChange={setSafeToOperate}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Inspection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </form>
  );
}
