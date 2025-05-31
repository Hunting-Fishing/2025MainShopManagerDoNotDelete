
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceView({ workOrder }: WorkOrderInvoiceViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('work-order-invoice');
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`work-order-${workOrder.id}.pdf`);
    }
  };

  // Calculate totals
  const subtotal = workOrder.total_cost || 0;
  const taxRate = workOrder.tax_rate || 0.08; // Default 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="bg-white">
      {/* Print/Download Actions - Hidden when printing */}
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <div id="work-order-invoice" className="max-w-4xl mx-auto bg-white p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WORK ORDER</h1>
            <div className="text-sm text-gray-600">
              <p>Work Order #: <span className="font-semibold">{workOrder.id}</span></p>
              <p>Date: <span className="font-semibold">{new Date(workOrder.created_at).toLocaleDateString()}</p>
              <p>Status: <span className="font-semibold capitalize">{workOrder.status}</span></p>
              {workOrder.technician && (
                <p>Technician: <span className="font-semibold">{workOrder.technician}</span></p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{workOrder.company_name || "Auto Shop"}</h2>
              <div className="text-sm text-gray-600">
                <p>{workOrder.company_address || "123 Main St"}</p>
                <p>{workOrder.company_city || "City"}, {workOrder.company_state || "State"} {workOrder.company_zip || "12345"}</p>
                <p>{workOrder.company_phone || "(555) 123-4567"}</p>
                <p>{workOrder.company_email || "info@autoshop.com"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">CUSTOMER INFORMATION</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold">{workOrder.customer_name || workOrder.customer || "Customer Name"}</p>
              <p>{workOrder.customer_address || "Customer Address"}</p>
              <p>{workOrder.customer_city || "City"}, {workOrder.customer_state || "State"} {workOrder.customer_zip || "ZIP"}</p>
              <p>Phone: {workOrder.customer_phone || "Phone Number"}</p>
              <p>Email: {workOrder.customer_email || "Email Address"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">VEHICLE INFORMATION</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1 font-semibold">VIN</th>
                    <th className="text-left py-1 font-semibold">Year</th>
                    <th className="text-left py-1 font-semibold">Make</th>
                    <th className="text-left py-1 font-semibold">Model</th>
                    <th className="text-left py-1 font-semibold">Mileage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-700">{workOrder.vehicle_vin || "N/A"}</td>
                    <td className="py-1 text-gray-700">{workOrder.vehicle_year || "N/A"}</td>
                    <td className="py-1 text-gray-700">{workOrder.vehicle_make || "N/A"}</td>
                    <td className="py-1 text-gray-700">{workOrder.vehicle_model || "N/A"}</td>
                    <td className="py-1 text-gray-700">{workOrder.vehicle_odometer || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">SERVICE DESCRIPTION</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-700">{workOrder.description || "No service description provided"}</p>
            {workOrder.notes && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-900">Notes:</p>
                <p className="text-sm text-gray-700">{workOrder.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">SERVICES & PARTS</h3>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold w-20">Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold w-24">Rate</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Labor/Service Entry */}
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {workOrder.service_type || "Service"}
                  {workOrder.description && (
                    <div className="text-xs text-gray-600 mt-1">{workOrder.description}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-sm">1</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                  ${(workOrder.total_cost || 0).toFixed(2)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">
                  ${(workOrder.total_cost || 0).toFixed(2)}
                </td>
              </tr>

              {/* Inventory Items */}
              {workOrder.inventoryItems?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {item.name}
                    {item.sku && (
                      <div className="text-xs text-gray-600">SKU: {item.sku}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{item.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                    ${item.unit_price.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Empty rows to maintain structure */}
              {(!workOrder.inventoryItems || workOrder.inventoryItems.length === 0) && (
                <>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-500" colSpan={4}>
                      No additional parts or services
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 mt-2 pt-2">
              <div className="flex justify-between py-1 text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Authorization */}
        <div className="border-t border-gray-300 pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-sm mb-2">TERMS & CONDITIONS</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Payment is due upon completion of work unless other arrangements have been made.</p>
                <p>• We are not responsible for loss or damage to vehicles or contents left in vehicles.</p>
                <p>• All work is guaranteed for 30 days or 1,000 miles, whichever comes first.</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">CUSTOMER AUTHORIZATION</h4>
              <div className="text-xs text-gray-600 mb-4">
                <p>I authorize the above repair work to be done and the necessary material to be furnished. I understand that a finance charge of 1.5% per month will be added to all accounts not paid within 30 days.</p>
              </div>
              
              <div className="border-t border-gray-400 pt-2">
                <div className="flex justify-between">
                  <span className="text-xs">Customer Signature</span>
                  <span className="text-xs">Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body { margin: 0; }
            .print\\:hidden { display: none !important; }
            #work-order-invoice { 
              max-width: none; 
              margin: 0; 
              padding: 20px; 
              box-shadow: none;
            }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
          }
        `}
      </style>
    </div>
  );
}
