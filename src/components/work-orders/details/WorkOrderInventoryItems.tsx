
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { formatDate } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";
import { WorkOrderInventoryItem } from '@/types/workOrder';

export interface WorkOrderInventoryItemsProps {
  workOrderId: string;
  inventoryItems: WorkOrderInventoryItem[];
}

export const WorkOrderInventoryItems: React.FC<WorkOrderInventoryItemsProps> = ({
  workOrderId,
  inventoryItems
}) => {
  if (!inventoryItems || inventoryItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>No inventory items have been added to this work order.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render inventory status badge with appropriate color
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    let badgeClass = "bg-slate-100 text-slate-800";
    
    switch (status.toLowerCase()) {
      case 'in stock':
        badgeClass = "bg-green-100 text-green-800";
        break;
      case 'ordered':
        badgeClass = "bg-blue-100 text-blue-800";
        break;
      case 'backorder':
        badgeClass = "bg-amber-100 text-amber-800";
        break;
      case 'special order':
        badgeClass = "bg-purple-100 text-purple-800";
        break;
      case 'discontinued':
        badgeClass = "bg-red-100 text-red-800";
        break;
    }
    
    return (
      <Badge className={badgeClass}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>
                    {item.name}
                    {item.category && (
                      <div className="text-xs text-slate-500">{item.category}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{renderStatusBadge(item.itemStatus)}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Additional details section */}
        <div className="mt-6 space-y-4">
          {inventoryItems.some(item => item.notes) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notes</h3>
              {inventoryItems.map(item => item.notes && (
                <div key={`note-${item.id}`} className="text-sm bg-slate-50 p-3 rounded-md">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-slate-600">{item.notes}</div>
                </div>
              ))}
            </div>
          )}
          
          {inventoryItems.some(item => item.estimatedArrivalDate) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Estimated Arrival Dates</h3>
              {inventoryItems.map(item => item.estimatedArrivalDate && (
                <div key={`arrival-${item.id}`} className="text-sm">
                  <span className="font-medium">{item.name}:</span> {formatDate(item.estimatedArrivalDate)}
                </div>
              ))}
            </div>
          )}
          
          {inventoryItems.some(item => item.supplierName) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Suppliers</h3>
              {inventoryItems.map(item => item.supplierName && (
                <div key={`supplier-${item.id}`} className="text-sm">
                  <span className="font-medium">{item.name}:</span> {item.supplierName}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
