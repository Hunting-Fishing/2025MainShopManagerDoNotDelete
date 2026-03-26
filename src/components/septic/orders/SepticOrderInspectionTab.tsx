import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ClipboardCheck, Plus, X, Wrench, MessageSquare, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SepticOrderInspectionTabProps {
  orderId: string;
  shopId: string | null;
  customerId: string | null;
}

const conditionOptions = [
  { value: 'good', label: 'Good', color: 'bg-green-100 text-green-800' },
  { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800' },
  { value: 'na', label: 'N/A', color: 'bg-muted text-muted-foreground' },
];

export default function SepticOrderInspectionTab({ orderId, shopId, customerId }: SepticOrderInspectionTabProps) {
  const queryClient = useQueryClient();
  const [newMaintItem, setNewMaintItem] = useState('');
  const [newPart, setNewPart] = useState('');

  // Fetch existing inspection for this order
  const { data: inspection, isLoading } = useQuery({
    queryKey: ['septic-order-inspection', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('septic_inspections' as any)
        .select('*')
        .eq('service_order_id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!orderId,
  });

  // Fetch templates for selector
  const { data: templates = [] } = useQuery({
    queryKey: ['septic-inspection-templates-published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('septic_inspection_templates')
        .select('id, name')
        
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Create inspection
  const createInspection = useMutation({
    mutationFn: async (templateId?: string) => {
      const payload: any = {
        shop_id: shopId,
        service_order_id: orderId,
        customer_id: customerId,
        inspection_date: new Date().toISOString().split('T')[0],
        inspector_name: '',
        overall_condition: 'good',
        maintenance_items: [],
        parts_requested: [],
        inspection_data: {},
        arrived_at: new Date().toISOString(),
      };
      if (templateId) payload.template_id = templateId;
      const { data, error } = await supabase
        .from('septic_inspections' as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-order-inspection', orderId] });
      toast.success('Inspection started');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Update inspection field
  const updateField = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: any }) => {
      if (!inspection?.id) return;
      const { error } = await supabase
        .from('septic_inspections' as any)
        .update({ [field]: value })
        .eq('id', inspection.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-order-inspection', orderId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addMaintenanceItem = () => {
    if (!newMaintItem.trim() || !inspection) return;
    const current = Array.isArray(inspection.maintenance_items) ? inspection.maintenance_items : [];
    updateField.mutate({ field: 'maintenance_items', value: [...current, newMaintItem.trim()] });
    setNewMaintItem('');
  };

  const removeMaintenanceItem = (index: number) => {
    if (!inspection) return;
    const current = Array.isArray(inspection.maintenance_items) ? [...inspection.maintenance_items] : [];
    current.splice(index, 1);
    updateField.mutate({ field: 'maintenance_items', value: current });
  };

  const addPart = () => {
    if (!newPart.trim() || !inspection) return;
    const current = Array.isArray(inspection.parts_requested) ? inspection.parts_requested : [];
    updateField.mutate({ field: 'parts_requested', value: [...current, newPart.trim()] });
    setNewPart('');
  };

  const removePart = (index: number) => {
    if (!inspection) return;
    const current = Array.isArray(inspection.parts_requested) ? [...inspection.parts_requested] : [];
    current.splice(index, 1);
    updateField.mutate({ field: 'parts_requested', value: current });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No inspection yet — show start button
  if (!inspection) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No inspection recorded for this service order</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {templates.length > 0 ? (
              <Select onValueChange={(val) => createInspection.mutate(val)}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Start with template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => createInspection.mutate(undefined)}
              disabled={createInspection.isPending}
            >
              {createInspection.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Start Blank Inspection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inspection exists — show form
  const maintItems = Array.isArray(inspection.maintenance_items) ? inspection.maintenance_items : [];
  const partsReq = Array.isArray(inspection.parts_requested) ? inspection.parts_requested : [];

  return (
    <div className="space-y-4">
      {/* System Condition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" /> System Condition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'overall_condition', label: 'Overall' },
              { key: 'tank_condition', label: 'Tank' },
              { key: 'drain_field_condition', label: 'Drain Field' },
              { key: 'baffle_condition', label: 'Baffle' },
              { key: 'effluent_filter_condition', label: 'Effluent Filter' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <Select
                  value={inspection[key] || ''}
                  onValueChange={(val) => updateField.mutate({ field: key, value: val })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" /> Maintenance Items Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {maintItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {maintItems.map((item: string, i: number) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {item}
                  <button onClick={() => removeMaintenanceItem(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add maintenance item..."
              value={newMaintItem}
              onChange={(e) => setNewMaintItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMaintenanceItem()}
              className="h-9"
            />
            <Button size="sm" variant="outline" onClick={addMaintenanceItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parts & Equipment Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" /> Parts & Equipment Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {partsReq.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {partsReq.map((item: string, i: number) => (
                <Badge key={i} variant="outline" className="gap-1 pr-1">
                  {item}
                  <button onClick={() => removePart(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add part or equipment..."
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPart()}
              className="h-9"
            />
            <Button size="sm" variant="outline" onClick={addPart}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Performed & Customer Remarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Work Performed</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe work performed..."
              defaultValue={inspection.work_performed || ''}
              onBlur={(e) => updateField.mutate({ field: 'work_performed', value: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" /> Customer Remarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Customer notes, concerns, or requests..."
              defaultValue={inspection.customer_remarks || ''}
              onBlur={(e) => updateField.mutate({ field: 'customer_remarks', value: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Inspector Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inspector Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="General inspection notes..."
            defaultValue={inspection.notes || ''}
            onBlur={(e) => updateField.mutate({ field: 'notes', value: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Timestamps */}
      <p className="text-xs text-muted-foreground text-right">
        Inspection started {inspection.arrived_at ? format(new Date(inspection.arrived_at), 'MMM d, yyyy h:mm a') : inspection.inspection_date || '—'}
      </p>
    </div>
  );
}
