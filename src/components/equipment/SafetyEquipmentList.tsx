import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

interface SafetyEquipmentItem {
  id: string;
  name: string;
  equipment_type: string;
  location: string;
  status: string;
  serial_number?: string;
  specifications?: {
    inspection_date?: string;
    expiry_date?: string;
    quantity?: number;
  };
  notes?: string;
}

interface SafetyEquipmentListProps {
  refreshTrigger?: number;
  parentEquipmentId?: string; // Filter by parent equipment
}

type StatusLevel = 'good' | 'warning' | 'urgent' | 'overdue';

export function SafetyEquipmentList({ refreshTrigger, parentEquipmentId }: SafetyEquipmentListProps) {
  const [items, setItems] = useState<SafetyEquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusLevel = (expiryDate?: string): StatusLevel => {
    if (!expiryDate) return 'good';
    
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);
    
    if (daysUntilExpiry < 0) return 'overdue';
    if (daysUntilExpiry <= 7) return 'urgent';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'good';
  };

  const getStatusConfig = (level: StatusLevel) => {
    switch (level) {
      case 'overdue':
        return {
          color: 'bg-red-100 border-red-500 text-red-700',
          badge: 'bg-red-500 text-white',
          icon: AlertTriangle,
          label: 'Overdue',
        };
      case 'urgent':
        return {
          color: 'bg-orange-50 border-orange-500 text-orange-700',
          badge: 'bg-orange-500 text-white',
          icon: AlertTriangle,
          label: 'Urgent',
        };
      case 'warning':
        return {
          color: 'bg-yellow-50 border-yellow-500 text-yellow-700',
          badge: 'bg-yellow-500 text-white',
          icon: Clock,
          label: 'Due Soon',
        };
      case 'good':
      default:
        return {
          color: 'bg-green-50 border-green-500 text-green-700',
          badge: 'bg-green-500 text-white',
          icon: ShieldCheck,
          label: 'Current',
        };
    }
  };

  const formatEquipmentType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    loadSafetyEquipment();
  }, [refreshTrigger]);

  const loadSafetyEquipment = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get shop_id from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .maybeSingle();

      const shop_id = profileData?.shop_id || user.id;

      // Fetch safety equipment - filter by common safety equipment types
      const safetyTypes = [
        'fire_extinguisher', 'life_raft', 'life_ring', 'epirb',
        'survival_suit', 'flare', 'first_aid_kit', 'safety_harness',
        'life_jacket', 'immersion_suit'
      ] as const;

      let query = supabase
        .from('equipment_assets')
        .select('*')
        .eq('shop_id', shop_id)
        .in('equipment_type', safetyTypes as any); // Cast for enum compatibility
      
      // Filter by parent equipment if specified
      if (parentEquipmentId) {
        query = query.eq('parent_equipment_id', parentEquipmentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map data with proper type casting for specifications
      const mappedItems = (data || []).map(item => ({
        ...item,
        equipment_type: item.equipment_type,
        specifications: item.specifications as SafetyEquipmentItem['specifications']
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error loading safety equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading safety equipment...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Safety Equipment</h3>
            <p className="text-sm text-muted-foreground">
              Click "Add Safety Equipment" to start tracking safety items
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const expiryDate = item.specifications?.expiry_date;
        const statusLevel = getStatusLevel(expiryDate);
        const statusConfig = getStatusConfig(statusLevel);
        const StatusIcon = statusConfig.icon;
        const daysUntilExpiry = expiryDate 
          ? differenceInDays(parseISO(expiryDate), new Date())
          : null;

        return (
          <Card key={item.id} className={`border-l-4 ${statusConfig.color.split(' ')[1]}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color.split(' ')[2]}`} />
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <Badge className={statusConfig.badge}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 text-foreground font-medium">
                        {formatEquipmentType(item.equipment_type)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-2 text-foreground">{item.location}</span>
                    </div>
                    
                    {item.serial_number && (
                      <div>
                        <span className="text-muted-foreground">Serial:</span>
                        <span className="ml-2 text-foreground">{item.serial_number}</span>
                      </div>
                    )}
                    
                    {item.specifications?.quantity && item.specifications.quantity > 1 && (
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="ml-2 text-foreground">{item.specifications.quantity}</span>
                      </div>
                    )}
                    
                    {item.specifications?.inspection_date && (
                      <div>
                        <span className="text-muted-foreground">Last Inspection:</span>
                        <span className="ml-2 text-foreground">
                          {format(parseISO(item.specifications.inspection_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {expiryDate && (
                      <div>
                        <span className="text-muted-foreground">Next Due:</span>
                        <span className={`ml-2 font-medium ${statusConfig.color.split(' ')[2]}`}>
                          {format(parseISO(expiryDate), 'MMM dd, yyyy')}
                          {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                            <span className="text-xs ml-1">
                              ({daysUntilExpiry} days)
                            </span>
                          )}
                          {daysUntilExpiry !== null && daysUntilExpiry < 0 && (
                            <span className="text-xs ml-1">
                              (Overdue)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {item.notes && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
