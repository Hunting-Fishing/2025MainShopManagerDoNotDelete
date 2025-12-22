
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapDatabasePartToWorkOrderPart } from '@/utils/databaseMappers';
import { Loader2, Package, DollarSign, AlertTriangle } from 'lucide-react';

export function PartsInventoryOverview() {
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts-inventory-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || [])
        .map(part => {
          try {
            return mapDatabasePartToWorkOrderPart(part);
          } catch (mapError) {
            console.error('Error mapping part:', mapError);
            return null;
          }
        })
        .filter(Boolean);
    }
  });

  const totalValue = parts.reduce((sum: number, part: any) => sum + (part.total_price || 0), 0);
  const totalQuantity = parts.reduce((sum: number, part: any) => sum + (part.quantity || 0), 0);
  const backorderedCount = parts.filter((part: any) => part.status === 'backordered').length;
  const recentParts = parts.slice(0, 8);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading parts inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
            <p className="text-xs text-muted-foreground">{totalQuantity} total quantity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Backordered Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backorderedCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting stock arrival</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Parts Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No parts data available</p>
              <p className="text-sm">Parts will appear here as work orders are created</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentParts.map((part: any) => (
                <div key={part.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{part.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Part #: {part.part_number} | Qty: {part.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(part.total_price || 0).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{part.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
