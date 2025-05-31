
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useWorkOrderInvoiceData } from '@/hooks/useWorkOrderInvoiceData';

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
}

export function WorkOrderInvoiceView({ workOrder, jobLines }: WorkOrderInvoiceViewProps) {
  const { customer, vehicle, shop, taxRate, loading, error } = useWorkOrderInvoiceData(workOrder);

  const subtotal = jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            Error loading invoice data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format customer address
  const formatCustomerAddress = () => {
    if (!customer) return '';
    const parts = [
      customer.address,
      customer.city,
      customer.state,
      customer.postal_code
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Format shop address
  const formatShopAddress = () => {
    if (!shop) return '';
    const parts = [
      shop.address,
      shop.city,
      shop.state,
      shop.postal_code
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {customer ? `${customer.first_name} ${customer.last_name}`.trim() : 'Customer Name'}
            </h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{formatCustomerAddress() || 'Customer Address'}</div>
              <div>{customer?.phone || 'Customer Phone'}</div>
              <div>{customer?.email || 'Customer Email'}</div>
            </div>
          </div>
          
          <div className="text-right">
            <h1 className="text-xl font-semibold mb-2">
              {shop?.name || 'Shop Name'}
            </h1>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{formatShopAddress() || 'Shop Address'}</div>
              <div>{shop?.phone || 'Shop Phone'}</div>
              <div>{shop?.email || 'Shop Email'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <div className="mb-2">
              <label className="text-sm font-medium">Work Order #</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                #{workOrder.id.slice(0, 8)}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <label className="text-sm font-medium">Date</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {new Date(workOrder.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {vehicle && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div>
              <label className="text-sm font-medium">VIN #</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {vehicle.vin || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {vehicle.year || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Make</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {vehicle.make || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {vehicle.model || 'N/A'}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="font-medium">Line item</div>
            <div className="font-medium text-right">Line total</div>
          </div>
          
          <div className="space-y-2">
            {jobLines.map((line) => (
              <div key={line.id} className="grid grid-cols-2 gap-4 py-2 border-b">
                <div>
                  <div className="font-medium">{line.name}</div>
                  {line.description && (
                    <div className="text-sm text-muted-foreground">{line.description}</div>
                  )}
                </div>
                <div className="text-right font-medium">
                  ${(line.totalAmount || 0).toFixed(2)}
                </div>
              </div>
            ))}
            
            {jobLines.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No labor items found
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between">
              <span className="font-medium">Sub Total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax ({(taxRate * 100).toFixed(2)}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Discount:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Paid:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-semibold">
              <span>Total Due:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
