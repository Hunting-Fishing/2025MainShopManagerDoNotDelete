
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { useWorkOrderInvoiceData } from '@/hooks/useWorkOrderInvoiceData';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface WorkOrderInvoiceViewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
}

export function WorkOrderInvoiceView({ workOrder, jobLines }: WorkOrderInvoiceViewProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);
  const { customer, vehicle, shop, taxRate, loading, error } = useWorkOrderInvoiceData(workOrder);

  useEffect(() => {
    const loadParts = async () => {
      try {
        setPartsLoading(true);
        const partsData = await getWorkOrderParts(workOrder.id);
        setParts(partsData);
      } catch (error) {
        console.error('Error loading parts for invoice:', error);
        toast.error('Failed to load parts data');
      } finally {
        setPartsLoading(false);
      }
    };

    loadParts();
  }, [workOrder.id]);

  if (loading || partsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading invoice data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p>Error loading invoice data: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const laborSubtotal = jobLines.reduce((total, line) => total + (line.total_amount || 0), 0);
  const partsSubtotal = parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);
  const subtotal = laborSubtotal + partsSubtotal;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Invoice Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Actions</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Invoice Content */}
      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {shop?.logo_url && (
                <img src={shop.logo_url} alt="Company Logo" className="h-16 mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600">#{workOrder.work_order_number || workOrder.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-gray-900">{shop?.name}</div>
              {shop?.address && <div className="text-gray-600">{shop.address}</div>}
              {shop?.city && shop?.state && (
                <div className="text-gray-600">{shop.city}, {shop.state} {shop.postal_code}</div>
              )}
              {shop?.phone && <div className="text-gray-600">{shop.phone}</div>}
              {shop?.email && <div className="text-gray-600">{shop.email}</div>}
            </div>
          </div>

          {/* Customer and Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
              <div className="text-gray-600">
                <div className="font-medium">{customer?.first_name} {customer?.last_name}</div>
                {customer?.email && <div>{customer.email}</div>}
                {customer?.phone && <div>{customer.phone}</div>}
                {customer?.address && <div>{customer.address}</div>}
                {customer?.city && customer?.state && (
                  <div>{customer.city}, {customer.state} {customer.postal_code}</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Information:</h3>
              <div className="text-gray-600">
                {vehicle && (
                  <>
                    <div>{vehicle.year} {vehicle.make} {vehicle.model}</div>
                    {vehicle.vin && <div>VIN: {vehicle.vin}</div>}
                    {vehicle.license_plate && <div>License: {vehicle.license_plate}</div>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Work Order Details:</h3>
            <div className="text-gray-600">
              <div><strong>Description:</strong> {workOrder.description}</div>
              <div><strong>Status:</strong> {workOrder.status}</div>
              <div><strong>Date:</strong> {new Date(workOrder.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Labor & Services */}
          {jobLines.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Labor & Services</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Hours</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobLines.map((line) => (
                      <tr key={line.id} className="border-b">
                        <td className="py-2">
                          <div className="font-medium">{line.name}</div>
                          {line.description && (
                            <div className="text-sm text-gray-600">{line.description}</div>
                          )}
                        </td>
                        <td className="text-right py-2">{line.estimated_hours || 0}</td>
                        <td className="text-right py-2">${(line.labor_rate || 0).toFixed(2)}</td>
                        <td className="text-right py-2">${(line.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-double">
                      <td colSpan={3} className="text-right py-2 font-medium">Labor Subtotal:</td>
                      <td className="text-right py-2 font-medium">${laborSubtotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Parts & Components */}
          {parts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Parts & Components</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Part Description</th>
                      <th className="text-left py-2">Part Number</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((part) => (
                      <tr key={part.id} className="border-b">
                        <td className="py-2">
                          <div className="font-medium">{part.partName}</div>
                          {part.supplierName && (
                            <div className="text-sm text-gray-600">Supplier: {part.supplierName}</div>
                          )}
                        </td>
                        <td className="py-2 text-gray-600">{part.partNumber || '-'}</td>
                        <td className="text-right py-2">{part.quantity}</td>
                        <td className="text-right py-2">${part.customerPrice.toFixed(2)}</td>
                        <td className="text-right py-2">${(part.customerPrice * part.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-double">
                      <td colSpan={4} className="text-right py-2 font-medium">Parts Subtotal:</td>
                      <td className="text-right py-2 font-medium">${partsSubtotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Tax ({(taxRate * 100).toFixed(2)}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-xl font-bold border-t">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-center text-gray-600">
            <p>Thank you for your business!</p>
            {shop?.email && <p>Questions? Contact us at {shop.email}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
