
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkOrderPartsEstimateProps {
  items: WorkOrderInventoryItem[];
}

export function WorkOrderPartsEstimate({ items }: WorkOrderPartsEstimateProps) {
  const estimateTotal = items.reduce((sum, item) => sum + (item.totalPrice || item.quantity * item.unitPrice), 0);
  
  if (items.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="bg-slate-50 pb-3 border-b">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Package className="h-5 w-5" />
          Parts & Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">
                  ${((item.totalPrice || (item.quantity * item.unitPrice))).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-semibold">
                Total:
              </TableCell>
              <TableCell className="text-right font-bold">
                ${estimateTotal.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
