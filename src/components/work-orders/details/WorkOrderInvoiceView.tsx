
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { PrinterIcon, Download } from 'lucide-react';

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
}

export function WorkOrderInvoiceView({ workOrder, jobLines }: WorkOrderInvoiceViewProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const partsData = await getWorkOrderParts(workOrder.id);
        setParts(partsData);
      } catch (error) {
        console.error('Error fetching parts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [workOrder.id]);

  // Calculate totals
  const laborSubtotal = jobLines.reduce((total, line) => {
    return total + (line.totalAmount || 0);
  }, 0);

  const partsSubtotal = parts.reduce((total, part) => {
    return total + (part.customerPrice * part.quantity);
  }, 0);

  const subtotal = laborSubtotal + partsSubtotal;
  const taxRate = 0.08; // 8% tax rate
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invoice...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Invoice</CardTitle>
              <p className="text-muted-foreground">Work Order #{workOrder.work_order_number}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Bill To</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{workOrder.customer_name}</p>
            {workOrder.customer_email && <p>{workOrder.customer_email}</p>}
            {workOrder.customer_phone && <p>{workOrder.customer_phone}</p>}
            {workOrder.customer_address && (
              <div>
                <p>{workOrder.customer_address}</p>
                <p>{workOrder.customer_city}, {workOrder.customer_state} {workOrder.customer_zip}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      {workOrder.vehicle && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Make/Model:</span> {workOrder.vehicle.make} {workOrder.vehicle.model}</p>
                <p><span className="font-medium">Year:</span> {workOrder.vehicle.year}</p>
              </div>
              <div>
                {workOrder.vehicle.vin && <p><span className="font-medium">VIN:</span> {workOrder.vehicle.vin}</p>}
                {workOrder.vehicle.license_plate && <p><span className="font-medium">License:</span> {workOrder.vehicle.license_plate}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Labor Services */}
      {jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Labor & Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobLines.map((line) => (
                <div key={line.id} className="flex justify-between items-start border-b pb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{line.name}</h4>
                    {line.description && (
                      <p className="text-sm text-muted-foreground">{line.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Hours: {line.estimatedHours?.toFixed(1) || '0.0'}</span>
                      <span>Rate: ${line.laborRate?.toFixed(2) || '0.00'}/hr</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${line.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2">
                <span>Labor Subtotal:</span>
                <span>${laborSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts */}
      {parts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parts & Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parts.map((part) => (
                <div key={part.id} className="flex justify-between items-start border-b pb-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{part.partName}</h4>
                    {part.partNumber && (
                      <p className="text-sm text-muted-foreground">Part #: {part.partNumber}</p>
                    )}
                    {part.supplierName && (
                      <p className="text-sm text-muted-foreground">Supplier: {part.supplierName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(part.customerPrice * part.quantity).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Qty: {part.quantity} × ${part.customerPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2">
                <span>Parts Subtotal:</span>
                <span>${partsSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Totals */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
