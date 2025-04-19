
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryItemExtended } from "@/types/inventory";
import { ReorderDialog } from "./ReorderDialog";
import { AutoReorderDialog } from "./AutoReorderDialog";

interface AlertItemRowProps {
  item: InventoryItemExtended;
  autoReorderSettings: { enabled: boolean } | Record<string, { enabled: boolean, threshold?: number, quantity?: number }>;
  reorderItem: (itemId: string, quantity: number) => Promise<boolean>;
  enableAutoReorder: (itemId: string, threshold: number, quantity: number) => Promise<boolean>;
}

export function AlertItemRow({ 
  item, 
  autoReorderSettings, 
  reorderItem, 
  enableAutoReorder 
}: AlertItemRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{item.reorderPoint}</TableCell>
      <TableCell>
        <Badge variant={item.quantity === 0 ? "destructive" : "outline"} className={
          item.quantity === 0 
            ? "bg-red-100 text-red-800 hover:bg-red-100" 
            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        }>
          {item.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <ReorderDialog item={item} onReorder={reorderItem} />
        <AutoReorderDialog 
          item={item} 
          autoReorderSettings={autoReorderSettings} 
          onEnableAutoReorder={enableAutoReorder} 
        />
      </TableCell>
    </TableRow>
  );
}
