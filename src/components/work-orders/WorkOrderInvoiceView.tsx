
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { printElement } from "@/utils/printUtils";

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceView({ workOrder }: WorkOrderInvoiceViewProps) {
  const handlePrint = () => {
    printElement("work-order-invoice", `Work Order ${workOrder.id}`);
  };

  const handleDownload = () => {
    // Implementation for PDF download would go here
    console.log("Download PDF functionality");
  };

  // Calculate totals
  const lineItems = [
    ...(workOrder.timeEntries?.map(entry => ({
      description: `Labor - ${entry.employee_name}`,
      quantity: entry.duration / 60, // Convert minutes to hours
      rate: 85.00, // Default hourly rate
      amount: (entry.duration / 60) * 85.00
    })) || []),
    ...(workOrder.inventoryItems?.map(item => ({
      description: item.name,
      quantity: item.quantity,
      rate: item.unit_price,
      amount: item.total
    })) || [])
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.08; // 8% tax rate
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="space-y-6">
      {/* Action Buttons - Hidden in print */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <div id="work-order-invoice" className="bg-white p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          {/* Company Info */}
          <div className="flex-1">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {workOrder.company_name || "Auto Repair Shop"}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{workOrder.company_address || "123 Main Street"}</div>
                <div>
                  {workOrder.company_city || "City"}, {workOrder.company_state || "ST"} {workOrder.company_zip || "12345"}
                </div>
                <div>Phone: {workOrder.company_phone || "(555) 123-4567"}</div>
                <div>Email: {workOrder.company_email || "info@autoshop.com"}</div>
              </div>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="text-right">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">WORK ORDER</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Work Order #:</span> {workOrder.id.slice(0, 8)}</div>
              <div><span className="font-semibold">Date:</span> {new Date(workOrder.created_at).toLocaleDateString()}</div>
              <div><span className="font-semibold">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  workOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                  workOrder.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  workOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {workOrder.status.toUpperCase()}
                </span>
              </div>
              <div><span className="font-semibold">Technician:</span> {workOrder.technician || "Not Assigned"}</div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              CUSTOMER INFORMATION
            </h3>
            <div className="space-y-1 text-sm">
              <div className="font-medium">{workOrder.customer_name || workOrder.customer || "Customer Name"}</div>
              <div>{workOrder.customer_address || "Customer Address"}</div>
              <div>
                {workOrder.customer_city || "City"}, {workOrder.customer_state || "ST"} {workOrder.customer_zip || "12345"}
              </div>
              <div>Phone: {workOrder.customer_phone || "(555) 000-0000"}</div>
              <div>Email: {workOrder.customer_email || "customer@email.com"}</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              VEHICLE INFORMATION
            </h3>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Year:</span> {workOrder.vehicle_year || "N/A"}</div>
              <div><span className="font-medium">Make:</span> {workOrder.vehicle_make || "N/A"}</div>
              <div><span className="font-medium">Model:</span> {workOrder.vehicle_model || "N/A"}</div>
              <div><span className="font-medium">VIN:</span> {workOrder.vehicle_vin || "N/A"}</div>
              <div><span className="font-medium">License Plate:</span> {workOrder.vehicle_license_plate || "N/A"}</div>
              <div><span className="font-medium">Odometer:</span> {workOrder.vehicle_odometer || "N/A"} miles</div>
            </div>
          </div>
        </div>

        {/* Service Description */}
        {workOrder.description && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              SERVICE DESCRIPTION
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {workOrder.description}
            </p>
          </div>
        )}

        {/* Line Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
            SERVICES & PARTS
          </h3>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold w-20">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold w-24">Rate</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length > 0 ? lineItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-sm">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">{item.quantity.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm">${item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">${item.amount.toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                    No services or parts recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="border border-gray-300">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
                <span className="text-sm font-medium">Subtotal:</span>
                <span className="text-sm">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
                <span className="text-sm font-medium">Tax ({(taxRate * 100).toFixed(0)}%):</span>
                <span className="text-sm">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                <span className="text-lg font-bold">TOTAL:</span>
                <span className="text-lg font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {workOrder.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              ADDITIONAL NOTES
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {workOrder.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6 mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-sm mb-2">TERMS & CONDITIONS</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Payment is due upon completion of work. All parts and labor are guaranteed for 30 days. 
                Customer is responsible for personal items left in vehicle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">CUSTOMER SIGNATURE</h4>
              <div className="border-b border-gray-400 h-12 mb-2"></div>
              <p className="text-xs text-gray-600">Date: ________________</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
