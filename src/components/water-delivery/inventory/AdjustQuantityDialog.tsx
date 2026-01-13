import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdjustInventoryQuantity, WaterInventoryItem } from '@/hooks/water-delivery/useWaterInventory';
import { Plus, Minus } from 'lucide-react';

interface AdjustQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WaterInventoryItem | null;
  type: 'add' | 'remove';
}

export function AdjustQuantityDialog({ open, onOpenChange, item, type }: AdjustQuantityDialogProps) {
  const [amount, setAmount] = React.useState('');
  const adjustMutation = useAdjustInventoryQuantity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !amount) return;
    
    const adjustment = type === 'add' 
      ? parseFloat(amount) 
      : -parseFloat(amount);
    
    adjustMutation.mutate({ id: item.id, adjustment }, {
      onSuccess: () => {
        onOpenChange(false);
        setAmount('');
      },
    });
  };

  const currentQty = item?.quantity_gallons || 0;
  const maxRemove = type === 'remove' ? currentQty : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'add' ? (
              <>
                <Plus className="h-5 w-5 text-green-600" />
                Add Stock
              </>
            ) : (
              <>
                <Minus className="h-5 w-5 text-amber-600" />
                Remove Stock
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {item?.water_delivery_products?.product_name} - {item?.location_id || item?.location_type}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <p className="text-2xl font-bold">{currentQty.toLocaleString()} gal</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {type === 'add' ? 'Amount to Add (gal)' : 'Amount to Remove (gal)'}
            </Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              max={maxRemove}
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
            {type === 'remove' && (
              <p className="text-xs text-muted-foreground">
                Maximum: {currentQty.toLocaleString()} gal
              </p>
            )}
          </div>

          {amount && (
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">New Stock Level</p>
              <p className="text-xl font-semibold">
                {Math.max(0, type === 'add' 
                  ? currentQty + parseFloat(amount || '0')
                  : currentQty - parseFloat(amount || '0')
                ).toLocaleString()} gal
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || parseFloat(amount) <= 0 || adjustMutation.isPending}
              className={type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              {adjustMutation.isPending ? 'Updating...' : type === 'add' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
