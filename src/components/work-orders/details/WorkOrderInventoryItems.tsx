import React, { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExtendedWorkOrderInventoryItem } from '../inventory/WorkOrderInventoryItem';
import { format } from "date-fns";
import { Clock, Package, Tag, Truck } from "lucide-react";

interface WorkOrderInventoryItemsProps {
  workOrderId: string; // Changed from 'workOrder' to 'workOrderId'
  inventoryItems: ExtendedWorkOrderInventoryItem[];
  onUpdateItems?: (items: ExtendedWorkOrderInventoryItem[]) => void;
}

export function WorkOrderInventoryItems({ 
  workOrderId, // Use workOrderId instead of workOrder
  inventoryItems,
  onUpdateItems 
}: WorkOrderInventoryItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!inventoryItems || inventoryItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parts & Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-gray-500">
            No parts or materials added to this work order.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group items by status
  const groupedItems: Record<string, ExtendedWorkOrderInventoryItem[]> = {};
  
  inventoryItems.forEach(item => {
    const status = item.itemStatus || 'In Stock';
    if (!groupedItems[status]) {
      groupedItems[status] = [];
    }
    groupedItems[status].push(item);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Parts & Materials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([status, statusItems]) => (
          <div key={status}>
            <h3 className="font-medium mb-3 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              {status === 'special-order' ? 'Special Order Parts' : 
               status === 'ordered' ? 'Ordered Parts' : 'In-Stock Parts'}
            </h3>
            
            <div className="space-y-4">
              {statusItems.map(item => (
                <div key={item.id} className="border rounded-md p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      
                      {item.notes && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-500">Notes</div>
                          <div className="text-sm">{item.notes}</div>
                        </div>
                      )}
                      
                      {status !== 'In Stock' && (
                        <>
                          {item.estimatedArrivalDate && (
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Expected: {format(new Date(item.estimatedArrivalDate), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                          
                          {item.supplierName && (
                            <div className="mt-1 flex items-center text-sm text-gray-600">
                              <Truck className="h-3 w-3 mr-1" />
                              <span>Supplier: {item.supplierName}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Quantity:</span>
                        <span>{item.quantity}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Price:</span>
                        <span>{formatCurrency(item.unit_price)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-sm">Total:</span>
                        <span>{formatCurrency(item.quantity * item.unit_price)}</span>
                      </div>
                      
                      {onUpdateItems && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => onUpdateItems(inventoryItems)}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="border-t pt-4 flex justify-between">
          <span className="font-medium">Total Parts & Materials:</span>
          <span className="font-bold">
            {formatCurrency(inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
