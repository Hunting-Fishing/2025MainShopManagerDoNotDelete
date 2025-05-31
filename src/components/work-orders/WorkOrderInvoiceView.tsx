
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { printElement } from "@/utils/printUtils";

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceView({ workOrder }: WorkOrderInvoiceViewProps) {
  const handlePrint = () => {
    printElement("work-order-invoice", `Work Order ${workOrder.id.slice(0, 8)}`);
  };

  // Calculate totals
  const subtotal = workOrder.total_cost || 0;
  const taxRate = 0.0825; // 8.25% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold">Work Order Invoice View</h2>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          #work-order-invoice {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          
          body {
            background: white !important;
          }
        }
      `}</style>

      <Card className="p-8 bg-white" id="work-order-invoice">
        {/* Header Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">A+ Auto Repair</h1>
            <div className="text-sm text-gray-600">
              <p>123 Main Street</p>
              <p>Anytown, ST 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@aplustAutorepair.com</p>
            </div>
          </div>

          {/* Work Order Info */}
          <div className="text-right">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">WORK ORDER</h2>
              <div className="text-sm">
                <p><span className="font-semibold">Work Order #:</span> {workOrder.id.slice(0, 8)}</p>
                <p><span className="font-semibold">Date:</span> {new Date(workOrder.created_at).toLocaleDateString()}</p>
                <p><span className="font-semibold">Status:</span> {workOrder.status.toUpperCase()}</p>
                {workOrder.due_date && (
                  <p><span className="font-semibold">Due Date:</span> {new Date(workOrder.due_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer and Vehicle Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Customer Info */}
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-800">CUSTOMER INFORMATION</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">Name:</span> {workOrder.customer || 'N/A'}</p>
              <p><span className="font-semibold">Customer ID:</span> {workOrder.customer_id?.slice(0, 8) || 'N/A'}</p>
              <p><span className="font-semibold">Phone:</span> (555) 123-4567</p>
              <p><span className="font-semibold">Email:</span> customer@email.com</p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-800">VEHICLE INFORMATION</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">VIN:</span> {workOrder.vehicle_id?.slice(0, 17) || 'N/A'}</p>
              <p><span className="font-semibold">Year:</span> {workOrder.vehicle_year || 'N/A'}</p>
              <p><span className="font-semibold">Make:</span> {workOrder.vehicle_make || 'N/A'}</p>
              <p><span className="font-semibold">Model:</span> {workOrder.vehicle_model || 'N/A'}</p>
              <p><span className="font-semibold">Mileage:</span> 85,000 miles</p>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="mb-8">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-800">SERVICE DESCRIPTION</h3>
            <p className="text-sm">{workOrder.description || 'No description provided'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 text-gray-800">SERVICES & PARTS</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 font-semibold">Description</th>
                  <th className="text-center p-4 font-semibold w-20">Qty</th>
                  <th className="text-right p-4 font-semibold w-24">Unit Price</th>
                  <th className="text-right p-4 font-semibold w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 ? (
                  workOrder.inventoryItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                          {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                        </div>
                      </td>
                      <td className="text-center p-4">{item.quantity}</td>
                      <td className="text-right p-4">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right p-4 font-medium">${item.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4" colSpan={1}>
                      <div>
                        <p className="font-medium">{workOrder.service_type || 'General Service'}</p>
                        <p className="text-sm text-gray-600">{workOrder.description || 'Service performed'}</p>
                      </div>
                    </td>
                    <td className="text-center p-4">1</td>
                    <td className="text-right p-4">${subtotal.toFixed(2)}</td>
                    <td className="text-right p-4 font-medium">${subtotal.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8.25%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technician and Notes */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-800">TECHNICIAN</h3>
            <p className="text-sm">{workOrder.technician || 'Not assigned'}</p>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-800">ADDITIONAL NOTES</h3>
            <p className="text-sm">{workOrder.notes || 'No additional notes'}</p>
          </div>
        </div>

        {/* Authorization Section */}
        <div className="border-t border-gray-300 pt-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              I hereby authorize the repair work described above along with the necessary materials,
              and grant permission to operate the vehicle for the purpose of testing and inspection.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-gray-400 pb-1 mb-2">
                <span className="text-sm text-gray-600">Customer Signature</span>
              </div>
              <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div>
              <div className="border-b border-gray-400 pb-1 mb-2">
                <span className="text-sm text-gray-600">Service Advisor</span>
              </div>
              <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
