import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { printElement } from "@/utils/printUtils";

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceView({ workOrder }: WorkOrderInvoiceViewProps) {
  const handlePrint = () => {
    printElement('work-order-print-view', `Work Order ${workOrder.id}`);
  };

  // Calculate totals (placeholder - will be enhanced with real data)
  const subtotal = workOrder.total_cost || 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      {/* Print Styles */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { margin: 0; padding: 20px; }
            .print-container { 
              box-shadow: none !important; 
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
          .print-only { display: none; }
        `}
      </style>

      {/* Print Button */}
      <div className="flex justify-end no-print">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Work Order
        </Button>
      </div>

      {/* Work Order Invoice Layout */}
      <div id="work-order-print-view" className="bg-white border border-gray-200 rounded-lg p-8 print-container">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Company Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">A+ Auto Repair</h1>
            <div className="text-gray-600">
              <p>123 Main Street</p>
              <p>Anytown, ST 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@aplusauto.com</p>
            </div>
          </div>

          {/* Work Order Info */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">WORK ORDER</h2>
            <div className="text-gray-600">
              <p><strong>Work Order #:</strong> {workOrder.id.slice(0, 8)}</p>
              <p><strong>Date:</strong> {new Date(workOrder.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {workOrder.status}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            CUSTOMER INFORMATION
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p><strong>Customer:</strong> {workOrder.customer || 'N/A'}</p>
              <p><strong>Phone:</strong> (555) 123-4567</p>
              <p><strong>Email:</strong> customer@email.com</p>
            </div>
            <div>
              <p><strong>Address:</strong></p>
              <p>456 Customer Lane</p>
              <p>Customer City, ST 54321</p>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            VEHICLE INFORMATION
          </h3>
          <div className="border border-gray-300 rounded">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">VIN</th>
                  <th className="px-4 py-2 text-left font-semibold">Year</th>
                  <th className="px-4 py-2 text-left font-semibold">Make</th>
                  <th className="px-4 py-2 text-left font-semibold">Model</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-t">{workOrder.vehicle_vin || 'N/A'}</td>
                  <td className="px-4 py-2 border-t">{workOrder.vehicle_year || 'N/A'}</td>
                  <td className="px-4 py-2 border-t">{workOrder.vehicle_make || 'N/A'}</td>
                  <td className="px-4 py-2 border-t">{workOrder.vehicle_model || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Services and Parts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            SERVICES & PARTS
          </h3>
          <div className="border border-gray-300 rounded">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                  <th className="px-4 py-2 text-center font-semibold">Qty</th>
                  <th className="px-4 py-2 text-right font-semibold">Rate</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-t">{workOrder.description || 'General Service'}</td>
                  <td className="px-4 py-2 border-t text-center">1</td>
                  <td className="px-4 py-2 border-t text-right">${subtotal.toFixed(2)}</td>
                  <td className="px-4 py-2 border-t text-right">${subtotal.toFixed(2)}</td>
                </tr>
                {/* Additional line items would go here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="border border-gray-300 rounded">
              <div className="flex justify-between px-4 py-2 border-b">
                <span className="font-semibold">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 border-b">
                <span className="font-semibold">Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 bg-gray-50 font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {workOrder.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              NOTES
            </h3>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-700">{workOrder.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm border-t border-gray-300 pt-4">
          <p>Thank you for choosing A+ Auto Repair!</p>
          <p>For questions about this work order, please contact us at (555) 123-4567</p>
        </div>
      </div>
    </div>
  );
}
