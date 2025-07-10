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
import { Calculator } from 'lucide-react';
import { CompactJobLinesTable } from '../job-lines/CompactJobLinesTable';
import { useWorkOrderJobLineOperations } from '@/hooks/useWorkOrderJobLineOperations';

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
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Enhanced job line operations
  const jobLineOperations = useWorkOrderJobLineOperations(jobLines, onWorkOrderUpdate);

  // Calculate totals from job lines and parts
  useEffect(() => {
    const jobLinesTotal = jobLines.reduce((sum, jobLine) => sum + (jobLine.total_amount || 0), 0);
    const partsTotal = allParts.reduce((sum, part) => sum + ((part.quantity || 1) * (part.customerPrice || part.unit_price || 0)), 0);
    const newSubtotal = jobLinesTotal + partsTotal;
    const newTax = newSubtotal * 0.08; // 8% tax rate - should be configurable
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newSubtotal + newTax);
  }, [jobLines, allParts]);

  const handleAddPart = async (partData: any) => {
    try {
      // Handle adding a part to a job line
      await onPartsChange();
    } catch (error) {
      console.error('Error adding part:', error);
    }
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
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <CompactJobLinesTable
            jobLines={jobLines}
            allParts={allParts}
            onUpdate={jobLineOperations.handleUpdateJobLine}
            onDelete={jobLineOperations.handleDeleteJobLine}
            onAddJobLine={jobLineOperations.handleAddJobLine}
            onAddPart={handleAddPart}
            onReorder={jobLineOperations.handleReorderJobLines}
            workOrderId={workOrder.id}
            isEditMode={isEditMode}
          />
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