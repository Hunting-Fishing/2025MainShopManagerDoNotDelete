
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapDatabasePartToWorkOrderPart } from '@/utils/databaseMappers';
import { Shield, Clock, AlertCircle } from 'lucide-react';

export function PartsWarrantyTracking() {
  const { data: partsWithWarranty = [], isLoading } = useQuery({
    queryKey: ['parts-warranty-tracking'],
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
        .filter(Boolean)
        .filter((part: any) => part.warrantyDuration || part.warrantyExpiryDate);
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Parts Warranty Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Shield className="h-5 w-5 mr-2 animate-pulse" />
              Loading warranty data...
            </div>
          ) : partsWithWarranty.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No warranty data available</p>
              <p className="text-sm">Parts with warranty information will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partsWithWarranty.map((part: any) => (
                <div key={part.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{part.name}</h3>
                      <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                    </div>
                    <Badge variant="outline">{part.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Install Date
                      </p>
                      <p className="font-medium">{part.installDate || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Warranty Duration</p>
                      <p className="font-medium">{part.warrantyDuration || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expires
                      </p>
                      <p className="font-medium">{part.warrantyExpiryDate || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-medium">
                        ${(part.supplierSuggestedRetail || part.total_price || 0).toFixed(2)}
                      </p>
                    </div>
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
