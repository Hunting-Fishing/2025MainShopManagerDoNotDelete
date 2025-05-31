
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceView({ workOrder }: WorkOrderInvoiceViewProps) {
  const handlePrint = () => {
    window.print();
  };

  // Calculate totals (mock data for now)
  const laborCost = workOrder.total_cost ? workOrder.total_cost * 0.6 : 150;
  const partsCost = workOrder.total_cost ? workOrder.total_cost * 0.4 : 100;
  const subtotal = laborCost + partsCost;
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="max-w-4xl mx-auto">
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-container { box-shadow: none !important; border: none !important; }
            body { margin: 0; padding: 20px; }
          }
        `}
      </style>
      
      {/* Print Button */}
      <div className="no-print mb-4 flex justify-end">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Work Order
        </Button>
      </div>

      <Card className="print-container p-8 bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          {/* Customer Info */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
            <div className="text-sm space-y-1">
              <div className="font-medium">{workOrder.customer || 'Customer Name'}</div>
              <div>123 Customer Street</div>
              <div>City, State 12345</div>
              <div>Phone: (555) 123-4567</div>
            </div>
          </div>

          {/* Company Info */}
          <div className="text-right">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">A+ Auto Repair</h1>
            <div className="text-sm space-y-1">
              <div>123 Shop Street</div>
              <div>City, State 12345</div>
              <div>Phone: (555) 987-6543</div>
              <div>Email: info@aplusauto.com</div>
            </div>
          </div>
        </div>

        {/* Work Order Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Work Order Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Work Order #:</span>
                <span className="font-medium">{workOrder.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(workOrder.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize">{workOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Technician:</span>
                <span>{workOrder.technician || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Payment Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span>Cash/Check/Card</span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span>{workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'Upon completion'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Vehicle Information</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b font-medium">VIN</th>
                  <th className="text-left p-3 border-b font-medium">Year</th>
                  <th className="text-left p-3 border-b font-medium">Make</th>
                  <th className="text-left p-3 border-b font-medium">Model</th>
                  <th className="text-left p-3 border-b font-medium">Mileage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b text-sm">{workOrder.vehicle_make || 'N/A'}</td>
                  <td className="p-3 border-b text-sm">{workOrder.vehicle_year || 'N/A'}</td>
                  <td className="p-3 border-b text-sm">{workOrder.vehicle_make || 'N/A'}</td>
                  <td className="p-3 border-b text-sm">{workOrder.vehicle_model || 'N/A'}</td>
                  <td className="p-3 border-b text-sm">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Description */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Service Description</h3>
          <div className="border rounded-lg p-4">
            <p className="text-sm">{workOrder.description || 'No description provided'}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Services & Parts</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b font-medium">Description</th>
                  <th className="text-center p-3 border-b font-medium">Qty</th>
                  <th className="text-right p-3 border-b font-medium">Rate</th>
                  <th className="text-right p-3 border-b font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b text-sm">Labor - {workOrder.description || 'General Service'}</td>
                  <td className="p-3 border-b text-sm text-center">{workOrder.estimated_hours || 1}</td>
                  <td className="p-3 border-b text-sm text-right">${(laborCost / (workOrder.estimated_hours || 1)).toFixed(2)}</td>
                  <td className="p-3 border-b text-sm text-right">${laborCost.toFixed(2)}</td>
                </tr>
                {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 ? (
                  workOrder.inventoryItems.map((item, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b text-sm">{item.name}</td>
                      <td className="p-3 border-b text-sm text-center">{item.quantity}</td>
                      <td className="p-3 border-b text-sm text-right">${item.unit_price.toFixed(2)}</td>
                      <td className="p-3 border-b text-sm text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 border-b text-sm">Parts & Materials</td>
                    <td className="p-3 border-b text-sm text-center">1</td>
                    <td className="p-3 border-b text-sm text-right">${partsCost.toFixed(2)}</td>
                    <td className="p-3 border-b text-sm text-right">${partsCost.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Terms & Conditions</h4>
              <p className="text-xs text-gray-600">
                Payment is due upon completion of work. All warranty claims must be accompanied by this work order.
                We are not responsible for items left in vehicle over 30 days.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer Signature</h4>
              <div className="border-b border-gray-300 h-12 mb-2"></div>
              <p className="text-xs text-gray-600">Date: _______________</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
