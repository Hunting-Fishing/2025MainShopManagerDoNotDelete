
import React, { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkOrderTabProps {
  workOrder: WorkOrder;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function CreateWorkOrderTab({ workOrder, onCreateWorkOrder }: CreateWorkOrderTabProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    description: workOrder.description || '',
    customer_name: workOrder.customer_name || '',
    customer_email: workOrder.customer_email || '',
    customer_phone: workOrder.customer_phone || '',
    customer_address: workOrder.customer_address || '',
    vehicle_make: workOrder.vehicle_make || '',
    vehicle_model: workOrder.vehicle_model || '',
    vehicle_year: workOrder.vehicle_year || '',
    vehicle_license_plate: workOrder.vehicle_license_plate || '',
    vehicle_vin: workOrder.vehicle_vin || '',
    priority: workOrder.priority || 'medium',
    status: 'pending',
    notes: workOrder.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: 'Error',
        description: 'Description is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (onCreateWorkOrder) {
        await onCreateWorkOrder(formData);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Work Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the work to be done..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => handleInputChange('customer_name', e.target.value)}
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange('customer_email', e.target.value)}
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Phone</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_address">Address</Label>
                    <Input
                      id="customer_address"
                      value={formData.customer_address}
                      onChange={(e) => handleInputChange('customer_address', e.target.value)}
                      placeholder="Customer address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicle_make">Make</Label>
                    <Input
                      id="vehicle_make"
                      value={formData.vehicle_make}
                      onChange={(e) => handleInputChange('vehicle_make', e.target.value)}
                      placeholder="Vehicle make"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_model">Model</Label>
                    <Input
                      id="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
                      placeholder="Vehicle model"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_year">Year</Label>
                    <Input
                      id="vehicle_year"
                      value={formData.vehicle_year}
                      onChange={(e) => handleInputChange('vehicle_year', e.target.value)}
                      placeholder="Vehicle year"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_license_plate">License Plate</Label>
                    <Input
                      id="vehicle_license_plate"
                      value={formData.vehicle_license_plate}
                      onChange={(e) => handleInputChange('vehicle_license_plate', e.target.value)}
                      placeholder="License plate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_vin">VIN</Label>
                    <Input
                      id="vehicle_vin"
                      value={formData.vehicle_vin}
                      onChange={(e) => handleInputChange('vehicle_vin', e.target.value)}
                      placeholder="Vehicle VIN"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Work Order...
                  </>
                ) : (
                  "Create Work Order"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
