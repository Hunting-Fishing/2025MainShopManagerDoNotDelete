
import React from 'react';
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WorkOrderPartsEstimateProps {
  items: WorkOrderInventoryItem[];
}

export function WorkOrderPartsEstimate({ items }: WorkOrderPartsEstimateProps) {
  // Calculate the total price for all items
  const total = items.reduce((acc, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    return acc + itemTotal;
  }, 0);

  const getStatusBadgeClass = (status?: string) => {
    switch(status) {
      case 'in-stock':
        return "bg-green-100 text-green-800 border-green-300";
      case 'ordered':
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 'special-order':
        return "bg-purple-100 text-purple-800 border-purple-300";
      case 'used-part':
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 'misc':
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>
                {item.itemStatus && (
                  <Badge variant="outline" className={getStatusBadgeClass(item.itemStatus)}>
                    {item.itemStatus.replace('-', ' ')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="py-4 px-6 border-t mt-auto">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Parts & Materials:</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
