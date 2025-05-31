
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
}

export function WorkOrderInvoiceView({ workOrder, jobLines }: WorkOrderInvoiceViewProps) {
  const subtotal = jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0);
  const taxRate = 0.0832; // 8.32% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">{workOrder.customer || 'Customer Name'}</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{workOrder.customer_address || '123 Customer Lane'}</div>
              <div>Big Sky, MT, 27303</div>
              <div>{workOrder.customer_phone || '919-867-477'}</div>
            </div>
          </div>
          
          <div className="text-right">
            <h1 className="text-xl font-semibold mb-2">A+ Auto Repair</h1>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>132 Main Street</div>
              <div>Big Sky, MT, 27303</div>
              <div>919-555-555</div>
              <div>www.a+autorepair.co</div>
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

        {(workOrder.vehicle_vin || workOrder.vehicle_year || workOrder.vehicle_make || workOrder.vehicle_model) && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div>
              <label className="text-sm font-medium">VIN #</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {workOrder.vehicle_vin || '#ABC19859100'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {workOrder.vehicle_year || '99'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Make</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {workOrder.vehicle_make || 'Ford'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {workOrder.vehicle_model || 'Taurus'}
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
              <span className="font-medium">Tax:</span>
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
