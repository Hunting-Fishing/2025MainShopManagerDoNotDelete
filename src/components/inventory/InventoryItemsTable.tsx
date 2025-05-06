
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
import { Edit, Trash2, Package, Plus, Minus, FileText, Barcode } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Status map for styling
const statusMap: Record<string, { color: string }> = {
  "In Stock": { color: "bg-green-100 text-green-800 border border-green-300" },
  "Low Stock": { color: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  "Out of Stock": { color: "bg-red-100 text-red-800 border border-red-300" },
  "Discontinued": { color: "bg-gray-100 text-gray-800 border border-gray-300" },
  "On Order": { color: "bg-blue-100 text-blue-800 border border-blue-300" },
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

  const handleAdjustQuantity = (id: string, adjustment: number) => {
    console.log(`Adjusting item ${id} by ${adjustment}`);
    // Would trigger inventory adjustment dialog
  };

  const handleViewHistory = (id: string) => {
    console.log(`View history for item ${id}`);
    // Would show transaction history for this item
  };

  const handleScanBarcode = (id: string) => {
    console.log(`Scan barcode for item ${id}`);
    // Would trigger barcode scanner
  };

  return (
    <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">Part #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50 border-b border-gray-100">
                <TableCell className="font-medium text-xs">
                  {item.partNumber || "—"}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {item.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{item.sku}</TableCell>
                <TableCell className="text-sm">{item.category}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 rounded-full"
                            onClick={() => handleAdjustQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Decrease quantity</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <span className={`font-medium ${item.quantity <= item.reorderPoint ? "text-red-600" : ""}`}>
                      {item.quantity}
                    </span>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 rounded-full"
                            onClick={() => handleAdjustQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Increase quantity</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${statusMap[item.status]?.color} px-3 py-1 font-normal`}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${item.cost?.toFixed(2) || "—"}
                </TableCell>
                <TableCell className="text-right">
                  ${item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>{item.location || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">History</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View transaction history</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScanBarcode(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Barcode className="h-4 w-4" />
                            <span className="sr-only">Barcode</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Scan barcode</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
