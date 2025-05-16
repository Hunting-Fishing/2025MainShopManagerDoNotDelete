
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InventoryItemExtended } from '@/types/inventory';
import { AutoReorderSettings } from '@/hooks/inventory/useInventoryManager';
import { getInventoryStatus } from '@/utils/inventory/inventoryUtils';
import { BadgeCheck, Bell } from 'lucide-react';
import AutoReorderDialog from './AutoReorderDialog';

interface AlertItemRowProps {
  item: InventoryItemExtended;
  autoReorderSettings?: Record<string, AutoReorderSettings>;
  reorderItem: (itemId: string, quantity: number) => Promise<void>;
  enableAutoReorder: (itemId: string, threshold: number, quantity: number) => Promise<void>;
}

export const AlertItemRow: React.FC<AlertItemRowProps> = ({
  item,
  autoReorderSettings,
  reorderItem,
  enableAutoReorder
}) => {
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const status = getInventoryStatus(item);
  const itemSettings = autoReorderSettings?.[item.id];
  
  const handleReorder = () => {
    // Default to ordering enough to get above reorder point
    const suggestedQuantity = Math.max(item.reorder_point - item.quantity + 5, 10);
    reorderItem(item.id, suggestedQuantity);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-gray-500">{item.sku}</div>
      </TableCell>
      <TableCell className="text-center">
        <span className={item.quantity <= 0 ? "text-red-500 font-bold" : "text-amber-500 font-medium"}>
          {item.quantity}
        </span>
      </TableCell>
      <TableCell className="text-center">{item.reorder_point}</TableCell>
      <TableCell>
        {status === "Out of Stock" ? (
          <span className="py-1 px-2 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
            Out of Stock
          </span>
        ) : (
          <span className="py-1 px-2 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
            Low Stock
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReorderDialog(true)}
            className="flex items-center gap-1"
          >
            <Bell className="h-4 w-4" />
            {itemSettings?.enabled ? 'Edit Auto-reorder' : 'Set Auto-reorder'}
          </Button>
          <Button
            size="sm"
            onClick={handleReorder}
            className="flex items-center gap-1"
          >
            <BadgeCheck className="h-4 w-4" />
            Reorder Now
          </Button>
        </div>
        {/* Reorder Dialog */}
        <AutoReorderDialog
          open={showReorderDialog}
          onClose={() => setShowReorderDialog(false)}
          item={item}
          currentSettings={itemSettings}
          onSave={(threshold, quantity) => enableAutoReorder(item.id, threshold, quantity)}
        />
      </TableCell>
    </TableRow>
  );
};

export default AlertItemRow;
