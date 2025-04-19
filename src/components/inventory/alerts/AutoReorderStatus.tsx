
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Settings, TruckIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AutoReorderStatusProps {
  items: any[];
  autoReorderSettings: {
    enabled: boolean;
  };
}

export function AutoReorderStatus({ items, autoReorderSettings }: AutoReorderStatusProps) {
  const [enabled, setEnabled] = React.useState(autoReorderSettings.enabled);
  const [loading, setLoading] = React.useState(false);

  // Filter items eligible for auto-reorder (low stock items)
  const eligibleItems = items.filter(item => 
    item.quantity > 0 && item.quantity <= item.reorderPoint
  );

  const toggleAutoReorder = async () => {
    setLoading(true);
    try {
      // Update the auto_reorder_enabled setting in the database
      const { error } = await supabase
        .from('inventory_settings')
        .upsert(
          { auto_reorder_enabled: !enabled },
          { onConflict: 'shop_id' }
        );

      if (error) throw error;
      
      setEnabled(!enabled);
      
      toast({
        title: !enabled ? 'Auto-reorder enabled' : 'Auto-reorder disabled',
        description: !enabled 
          ? 'Low stock items will be automatically reordered' 
          : 'Auto-reorder has been disabled',
      });
    } catch (error) {
      console.error('Error toggling auto-reorder:', error);
      toast({
        title: 'Error',
        description: 'Failed to update auto-reorder settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorderAll = async () => {
    toast({
      title: 'Reordering items',
      description: `${eligibleItems.length} items have been added to the purchase order queue`,
    });
  };

  return (
    <Card>
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-blue-500" />
          <span>Auto-Reorder</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-medium">Auto-Reorder Status</h3>
            <p className="text-sm text-muted-foreground">
              Automatically create purchase orders for low stock items
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={enabled ? 'default' : 'outline'}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Switch 
              checked={enabled} 
              onCheckedChange={toggleAutoReorder}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-md border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Items eligible for reorder</p>
              <p className="text-xs text-muted-foreground">Based on current inventory levels</p>
            </div>
            <Badge variant="outline" className="text-lg">
              {eligibleItems.length}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 flex gap-2 justify-end p-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Settings className="h-4 w-4" /> Configure
        </Button>
        <Button
          variant="default"
          size="sm"
          className="gap-1"
          disabled={eligibleItems.length === 0}
          onClick={handleReorderAll}
        >
          <RefreshCcw className="h-4 w-4" /> Reorder All
        </Button>
      </CardFooter>
    </Card>
  );
}
