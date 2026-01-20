import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { usePowerWashingLowStock } from '@/hooks/power-washing/usePowerWashingLowStock';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function LowStockWidget() {
  const navigate = useNavigate();
  const { lowStockItems, lowStockCount, isLoading } = usePowerWashingLowStock();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (lowStockCount === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-600">Inventory Good</p>
              <p className="text-sm text-muted-foreground">All items above reorder point</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alert
          </CardTitle>
          <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">
            {lowStockCount} item{lowStockCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lowStockItems.slice(0, 5).map((item: any) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between text-sm p-2 bg-background/50 rounded-lg"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-amber-600">
                {item.quantity} {item.unit_of_measure}
              </p>
              <p className="text-xs text-muted-foreground">
                Reorder at {item.reorder_point}
              </p>
            </div>
          </div>
        ))}
        
        <Button
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={() => navigate('/power-washing/store')}
        >
          View Inventory
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
