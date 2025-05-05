
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoReorderSettings, InventoryItemExtended } from '@/types/inventory';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, ShoppingCart } from 'lucide-react';

interface AutoReorderStatusProps {
  items: InventoryItemExtended[];
  autoReorderSettings: AutoReorderSettings;
}

export function AutoReorderStatus({ items, autoReorderSettings }: AutoReorderStatusProps) {
  const itemsNeedingReorder = items.filter(item => item.quantity <= item.reorderPoint);
  
  return (
    <Card className="border-l-4 border-l-blue-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          Auto-Reorder Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reorder">Automatic reordering</Label>
              <p className="text-xs text-muted-foreground">
                System will place orders when items reach reorder points
              </p>
            </div>
            <Switch
              id="auto-reorder"
              checked={autoReorderSettings.enabled}
              // This would connect to a real function in production
              onCheckedChange={() => console.log('Toggle auto-reorder')}
            />
          </div>
          
          {autoReorderSettings.enabled ? (
            <>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span>Items waiting for reorder:</span>
                  <span className="font-medium">{itemsNeedingReorder.length}</span>
                </div>
                
                <div className="flex justify-between py-1">
                  <span>Next scheduled check:</span>
                  <span className="font-medium">Today at 5:00 PM</span>
                </div>
                
                <div className="flex justify-between py-1">
                  <span>Last reorder processed:</span>
                  <span className="font-medium">May 4, 2025</span>
                </div>
              </div>
              
              <button className="text-sm text-blue-600 flex items-center">
                <RefreshCw className="h-3 w-3 mr-1" /> Run reorder check now
              </button>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Auto-reordering is currently disabled. Enable to automatically maintain inventory levels.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
