
import { Link } from "react-router-dom";
import { InventoryItemExtended } from "@/types/inventory";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Status map for styling
const statusMap = {
  "In Stock": { color: "bg-green-100 text-green-800 border border-green-300" },
  "Low Stock": { color: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  "Out of Stock": { color: "bg-red-100 text-red-800 border border-red-300" },
};

interface InventoryTableProps {
  items: InventoryItemExtended[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  // Calculate quantity available (quantity - reserved)
  const getQuantityAvailable = (item: InventoryItemExtended) => {
    const reserved = item.onHold || 0;
    return item.quantity - reserved;
  };

  // Calculate markup percentage
  const calculateMarkup = (cost: number | undefined, price: number) => {
    if (!cost || cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

  // Format date strings to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px] font-medium">Part #</TableHead>
            <TableHead className="font-medium">Item Name</TableHead>
            <TableHead className="font-medium">SKU</TableHead>
            <TableHead className="font-medium">Barcode</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Brand / Manufacturer</TableHead>
            <TableHead className="font-medium">Location</TableHead>
            <TableHead className="font-medium">Qty In Stock</TableHead>
            <TableHead className="font-medium">Qty Reserved</TableHead>
            <TableHead className="font-medium">Qty Available</TableHead>
            <TableHead className="font-medium">Qty on Order</TableHead>
            <TableHead className="font-medium">Reorder Level</TableHead>
            <TableHead className="font-medium">Unit Cost</TableHead>
            <TableHead className="font-medium">Unit Price</TableHead>
            <TableHead className="font-medium">Markup %</TableHead>
            <TableHead className="font-medium">Total Value</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Supplier</TableHead>
            <TableHead className="font-medium">Last Ordered</TableHead>
            <TableHead className="font-medium">Last Used</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="font-medium text-slate-700">
                  {item.partNumber || item.id.substring(0, 8)}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.barcode || "N/A"}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-300">
                    {item.category}
                  </span>
                </TableCell>
                <TableCell>{item.manufacturer || "N/A"}</TableCell>
                <TableCell>{item.location || "N/A"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.onHold || 0}</TableCell>
                <TableCell>{getQuantityAvailable(item)}</TableCell>
                <TableCell>{item.onOrder || 0}</TableCell>
                <TableCell>{item.reorderPoint}</TableCell>
                <TableCell>${item.cost?.toFixed(2) || "N/A"}</TableCell>
                <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>
                  {item.marginMarkup || calculateMarkup(item.cost, item.unitPrice).toFixed(2)}%
                </TableCell>
                <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[item.status as keyof typeof statusMap]?.color || "bg-gray-100 text-gray-800"}`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                    {item.supplier}
                  </span>
                </TableCell>
                <TableCell>{formatDate(item.dateBought)}</TableCell>
                <TableCell>{formatDate(item.dateLast)}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/inventory/${item.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                    View
                  </Link>
                  <Link to={`/inventory/${item.id}/edit`} className="text-blue-600 hover:text-blue-800">
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={21} className="h-[200px] text-center">
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="text-lg font-medium text-slate-700">No inventory items found</div>
                  <p className="text-slate-500 max-w-md text-center">
                    Get started by adding your first inventory item to keep track of your stock.
                  </p>
                  <Button asChild className="mt-4 rounded-full bg-blue-600 hover:bg-blue-700">
                    <Link to="/inventory/add">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Item
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
