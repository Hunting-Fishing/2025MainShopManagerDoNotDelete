import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface WorkOrderDetailedFormProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onWorkOrderUpdate: () => Promise<void>;
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
}

interface LineItem {
  id: string;
  type: 'labor' | 'parts' | 'sublet' | 'note';
  description: string;
  partNumber?: string;
  quantity: number;
  price: number;
  rate?: number;
  hours?: number;
  lineTotal: number;
}

export function WorkOrderDetailedForm({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onWorkOrderUpdate,
  onPartsChange,
  isEditMode
}: WorkOrderDetailedFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Initialize line items from job lines and parts
  useEffect(() => {
    const items: LineItem[] = [];
    
    // Add job lines as labor items
    jobLines.forEach(jobLine => {
      items.push({
        id: jobLine.id,
        type: 'labor',
        description: jobLine.name || '',
        quantity: 1,
        price: jobLine.labor_rate || 0,
        rate: jobLine.labor_rate || 0,
        hours: jobLine.estimated_hours || 0,
        lineTotal: jobLine.total_amount || 0
      });
    });

    // Add parts
    allParts.forEach(part => {
      items.push({
        id: part.id || '',
        type: 'parts',
        description: part.name || '',
        partNumber: part.part_number || '',
        quantity: part.quantity || 1,
        price: part.customerPrice || part.unit_price || 0,
        lineTotal: (part.quantity || 1) * (part.customerPrice || part.unit_price || 0)
      });
    });

    setLineItems(items);
  }, [jobLines, allParts]);

  // Calculate totals
  useEffect(() => {
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const newTax = newSubtotal * 0.08; // 8% tax rate - should be configurable
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newSubtotal + newTax);
  }, [lineItems]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `new-${Date.now()}`,
      type: 'labor',
      description: '',
      quantity: 1,
      price: 0,
      lineTotal: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        // Recalculate line total
        if (updated.type === 'labor' && updated.hours && updated.rate) {
          updated.lineTotal = updated.hours * updated.rate;
        } else {
          updated.lineTotal = updated.quantity * updated.price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={customer ? `${customer.first_name} ${customer.last_name}` : ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={customer?.phone || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                value={customer?.email || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="customer-address">Address</Label>
              <Input
                id="customer-address"
                value={customer?.address || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="vehicle-year">Year</Label>
              <Input
                id="vehicle-year"
                value={workOrder.vehicle_year || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vehicle-make">Make</Label>
              <Input
                id="vehicle-make"
                value={workOrder.vehicle_make || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vehicle-model">Model</Label>
              <Input
                id="vehicle-model"
                value={workOrder.vehicle_model || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vehicle-vin">VIN</Label>
              <Input
                id="vehicle-vin"
                value={workOrder.vehicle_vin || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vehicle-license">License Plate</Label>
              <Input
                id="vehicle-license"
                value={workOrder.vehicle_license_plate || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vehicle-mileage">Mileage</Label>
              <Input
                id="vehicle-mileage"
                value={workOrder.vehicle_odometer || ''}
                readOnly={!isEditMode}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="work-order-number">Work Order #</Label>
              <Input
                id="work-order-number"
                value={workOrder.work_order_number || workOrder.id.slice(0, 8)}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="work-order-date">Date</Label>
              <Input
                id="work-order-date"
                value={workOrder.created_at ? new Date(workOrder.created_at).toLocaleDateString() : ''}
                readOnly
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="work-description">Description</Label>
            <Textarea
              id="work-description"
              value={workOrder.description || ''}
              readOnly={!isEditMode}
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Line Items</span>
            {isEditMode && (
              <Button onClick={addLineItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-left p-2 font-medium">Part #</th>
                  <th className="text-left p-2 font-medium w-20">Qty</th>
                  <th className="text-left p-2 font-medium w-24">Price</th>
                  <th className="text-left p-2 font-medium w-20">Hours</th>
                  <th className="text-left p-2 font-medium w-24">Line Total</th>
                  {isEditMode && <th className="text-left p-2 font-medium w-12">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Select
                        value={item.type}
                        onValueChange={(value: 'labor' | 'parts' | 'sublet' | 'note') =>
                          updateLineItem(item.id, { type: value })
                        }
                        disabled={!isEditMode}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="labor">Labor</SelectItem>
                          <SelectItem value="parts">Parts</SelectItem>
                          <SelectItem value="sublet">Sublet</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, { description: e.target.value })
                        }
                        readOnly={!isEditMode}
                        className="min-w-[200px]"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={item.partNumber || ''}
                        onChange={(e) =>
                          updateLineItem(item.id, { partNumber: e.target.value })
                        }
                        readOnly={!isEditMode}
                        className="w-24"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, { quantity: Number(e.target.value) })
                        }
                        readOnly={!isEditMode}
                        className="w-20"
                        min="0"
                        step="1"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateLineItem(item.id, { price: Number(e.target.value) })
                        }
                        readOnly={!isEditMode}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.hours || ''}
                        onChange={(e) =>
                          updateLineItem(item.id, { hours: Number(e.target.value) })
                        }
                        readOnly={!isEditMode}
                        className="w-20"
                        min="0"
                        step="0.25"
                        disabled={item.type !== 'labor'}
                      />
                    </td>
                    <td className="p-2 font-medium">
                      ${item.lineTotal.toFixed(2)}
                    </td>
                    {isEditMode && (
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                          className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Tax (8%):</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-primary/20">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {isEditMode && (
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">
            Cancel Changes
          </Button>
          <Button>
            Save Work Order
          </Button>
        </div>
      )}
    </div>
  );
}