import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddSafetyEquipmentDialog } from './AddSafetyEquipmentDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SafetyEquipment {
  id: string;
  equipment_type: string;
  name: string;
  serial_number?: string;
  location: string;
  inspection_date?: string;
  expiry_date?: string;
  status: string;
  quantity?: number;
  notes?: string;
  created_at: string;
}

export function SafetyEquipmentList() {
  const [equipment, setEquipment] = useState<SafetyEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSafetyEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_assets')
        .select('*')
        .in('equipment_type', [
          'fire_extinguisher',
          'life_raft',
          'life_ring',
          'epirb',
          'survival_suit',
          'flare',
          'first_aid_kit',
          'safety_harness',
          'life_jacket',
          'immersion_suit'
        ])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching safety equipment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load safety equipment',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyEquipment();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      operational: { label: 'Operational', variant: 'default' as const, icon: CheckCircle },
      expired: { label: 'Expired', variant: 'destructive' as const, icon: XCircle },
      inspection_due: { label: 'Inspection Due', variant: 'secondary' as const, icon: AlertTriangle },
      maintenance: { label: 'Maintenance', variant: 'secondary' as const, icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.operational;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatEquipmentType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading safety equipment...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Safety Equipment
          </h2>
          <p className="text-sm text-muted-foreground">
            Track fire extinguishers, life rafts, EPIRBs, survival suits, and other safety equipment
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Safety Equipment
        </Button>
      </div>

      <AddSafetyEquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchSafetyEquipment}
      />

      {equipment.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No safety equipment recorded</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your safety equipment for inspections and compliance
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Safety Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{item.name}</span>
                  {getStatusBadge(item.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{formatEquipmentType(item.equipment_type)}</span>
                </div>
                
                {item.serial_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Serial:</span>
                    <span className="font-medium">{item.serial_number}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{item.location}</span>
                </div>
                
                {item.quantity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                )}
                
                {item.inspection_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Inspection:</span>
                    <span className="font-medium">
                      {format(new Date(item.inspection_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                
                {item.expiry_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="font-medium">
                      {format(new Date(item.expiry_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                
                {item.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">{item.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
