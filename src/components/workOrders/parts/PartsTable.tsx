
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash, Plus, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkOrderInventoryItem } from '@/types/workOrder';

interface PartsTableProps {
  items: WorkOrderInventoryItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  readOnly?: boolean;
}

export function PartsTable({ 
  items, 
  onRemoveItem, 
  onUpdateQuantity, 
  readOnly = false 
}: PartsTableProps) {
  const calculateTotal = (item: WorkOrderInventoryItem) => {
    return item.quantity * item.unitPrice;
  };
  
  const totalCost = items.reduce((total, item) => {
    return total + calculateTotal(item);
  }, 0);
  
  const getStatusBadgeClass = (status?: string) => {
    switch(status) {
      case 'in-stock':
        return "bg-green-100 text-green-800 border border-green-300";
      case 'ordered':
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case 'special-order':
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case 'used-part':
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case 'misc':
      default:
        return "bg-slate-100 text-slate-800 border border-slate-300";
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-gray-50">
        <p className="text-muted-foreground">No parts added to this work order.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {!readOnly && <TableHead className="w-[100px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${item.id}-${index}`}>
              <TableCell>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.sku}</div>
              </TableCell>
              <TableCell>
                {item.itemStatus && (
                  <Badge variant="outline" className={getStatusBadgeClass(item.itemStatus)}>
                    {item.itemStatus.replace('-', ' ')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                {readOnly ? (
                  item.quantity
                ) : (
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">${calculateTotal(item).toFixed(2)}</TableCell>
              {!readOnly && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          
          {/* Total row */}
          <TableRow>
            <TableCell colSpan={4} className="text-right font-medium">
              Total
            </TableCell>
            <TableCell className="text-right font-bold">
              ${totalCost.toFixed(2)}
            </TableCell>
            {!readOnly && <TableCell />}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
