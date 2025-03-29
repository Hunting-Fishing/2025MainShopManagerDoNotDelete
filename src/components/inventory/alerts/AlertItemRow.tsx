
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryItemExtended } from "@/types/inventory";
import { AutoReorderSettings } from "@/hooks/useInventoryManager";
import { ReorderDialog } from "./ReorderDialog";
import { AutoReorderDialog } from "./AutoReorderDialog";

interface AlertItemRowProps {
  item: InventoryItemExtended;
  autoReorderSettings: Record<string, AutoReorderSettings>;
  reorderItem: (itemId: string, quantity: number) => void;
  enableAutoReorder: (itemId: string, threshold: number, quantity: number) => void;
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
