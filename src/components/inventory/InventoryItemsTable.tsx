
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Status map for styling
const statusMap: Record<string, { color: string }> = {
  "In Stock": { color: "bg-green-100 text-green-800 border border-green-300" },
  "Low Stock": { color: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  "Out of Stock": { color: "bg-red-100 text-red-800 border border-red-300" },
};

interface InventoryItemsTableProps {
  items: InventoryItemExtended[];
}

export function InventoryItemsTable({ items }: InventoryItemsTableProps) {
  const navigate = useNavigate();
  
  const handleEdit = (id: string) => {
    navigate(`/inventory/${id}/edit`);
  };
  
  // Would be implemented in a future feature
  const handleDelete = (id: string) => {
    console.log("Delete item", id);
    // Would show confirmation dialog and delete item
  };

  return (
    <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50 border-b border-gray-100">
                <TableCell className="font-medium text-xs text-gray-500">
                  {item.id.substring(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">
                  {item.name}
                </TableCell>
                <TableCell className="text-sm">{item.sku}</TableCell>
                <TableCell className="text-sm">{item.category}</TableCell>
                <TableCell className="text-center">
                  <span className={`font-medium ${item.quantity <= item.reorderPoint ? "text-red-600" : ""}`}>
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${statusMap[item.status]?.color} px-3 py-1 font-normal`}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>{item.location || "—"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
