
import { InventoryItemExtended } from "@/types/inventory";
import { InventoryTable } from "./InventoryTable";

interface InventoryItemsTableProps {
  items: InventoryItemExtended[];
}

export function InventoryItemsTable({ items }: InventoryItemsTableProps) {
  return (
    <div className="w-full">
      <InventoryTable items={items} />
    </div>
  );
}
