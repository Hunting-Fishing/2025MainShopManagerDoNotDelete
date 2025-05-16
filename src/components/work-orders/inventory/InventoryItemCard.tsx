
import React from 'react';
import { InventoryItemExtended } from '@/types/inventory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventoryItemCardProps {
  item: InventoryItemExtended;
  onSelect: (item: InventoryItemExtended) => void;
  alreadySelected?: boolean;
}

export function InventoryItemCard({ item, onSelect, alreadySelected = false }: InventoryItemCardProps) {
  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Display item status with appropriate colors
  const getStatusBadge = () => {
    if (item.quantity <= 0) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
    } else if (item.quantity <= item.reorder_point) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
    }
  };

  return (
    <Card className={`border overflow-hidden transition-all ${alreadySelected ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
            <p className="text-sm font-medium mt-1">{formatPrice(item.unit_price)}</p>
          </div>
          
          <div className="space-y-2 flex flex-col items-end">
            {getStatusBadge()}
            
            <p className="text-xs text-muted-foreground">
              {item.quantity} in stock
            </p>
            
            {item.quantity <= 0 ? (
              <div className="flex items-center text-red-600 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unavailable
              </div>
            ) : (
              <Button 
                size="sm" 
                variant={alreadySelected ? "secondary" : "outline"} 
                onClick={() => onSelect(item)}
                disabled={alreadySelected}
              >
                {alreadySelected ? (
                  "Added"
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {item.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {item.description}
          </p>
        )}
        
        {item.category && (
          <div className="mt-3">
            <Badge variant="outline" className="bg-slate-100 text-xs">
              {item.category}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
