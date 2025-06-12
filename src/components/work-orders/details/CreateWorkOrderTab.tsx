
import React, { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerSearchInput } from '@/components/customers/CustomerSearchInput';
import { VehicleSelect } from '@/components/work-orders/customer-select/VehicleSelect';
import { AddVehicleDialog } from '@/components/customers/vehicles/AddVehicleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, CustomerVehicle } from '@/types/customer';
import { User, Car, Plus, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkOrderTabProps {
  workOrder?: WorkOrder;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function CreateWorkOrderTab({ workOrder, onCreateWorkOrder }: CreateWorkOrderTabProps) {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(null);
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium',
    status: 'pending',
    notes: '',
    // Asset details
    assetType: 'vehicle', // vehicle, equipment, other
    assetDescription: '',
    assetModel: '',
    assetSerial: '',
  });

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setSelectedVehicle(null); // Reset vehicle selection when customer changes
  };

  const handleVehicleSelect = (vehicle: CustomerVehicle | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        assetType: 'vehicle',
        assetDescription: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        assetModel: vehicle.model || '',
        assetSerial: vehicle.vin || '',
      }));
    }
  };

  const handleAddVehicle = (newVehicle: CustomerVehicle) => {
    setSelectedVehicle(newVehicle);
    setShowAddVehicleDialog(false);
    handleVehicleSelect(newVehicle);
    toast({
      title: "Vehicle Added",
      description: "New vehicle has been added and selected for this work order.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer before creating the work order.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for the work order.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const workOrderData = {
        customer_id: selectedCustomer.id,
        customer_name: `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
        customer_email: selectedCustomer.email,
        customer_phone: selectedCustomer.phone,
        customer_address: selectedCustomer.address,
        vehicle_id: selectedVehicle?.id,
        vehicle_make: selectedVehicle?.make || formData.assetModel,
        vehicle_model: selectedVehicle?.model || '',
        vehicle_year: selectedVehicle?.year || '',
        vehicle_vin: selectedVehicle?.vin || formData.assetSerial,
        vehicle_license_plate: selectedVehicle?.license_plate || '',
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        notes: formData.notes,
        service_type: formData.assetType,
        created_at: new Date().toISOString(),
      };

      if (onCreateWorkOrder) {
        await onCreateWorkOrder(workOrderData);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Select Customer</Label>
              <CustomerSearchInput
                onSelectCustomer={handleCustomerSelect}
                selectedCustomer={selectedCustomer}
                placeholderText="Search for a customer..."
              />
            </div>
            
            {selectedCustomer && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800">Selected Customer</h4>
                <p className="text-sm text-green-700">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </p>
                <p className="text-sm text-green-600">
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle/Asset Selection */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle/Asset Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assetType">Asset Type</Label>
                <Select 
                  value={formData.assetType} 
                  onValueChange={(value) => handleInputChange('assetType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="other">Other Asset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.assetType === 'vehicle' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="vehicle">Select Vehicle</Label>
                      <VehicleSelect
                        customerId={selectedCustomer.id}
                        onSelectVehicle={handleVehicleSelect}
                        selectedVehicleId={selectedVehicle?.id}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddVehicleDialog(true)}
                      className="mt-6"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Vehicle
                    </Button>
                  </div>

                  {selectedVehicle && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800">Selected Vehicle</h4>
                      <p className="text-sm text-blue-700">
                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </p>
                      {selectedVehicle.license_plate && (
                        <p className="text-sm text-blue-600">
                          License: {selectedVehicle.license_plate}
                        </p>
                      )}
                      {selectedVehicle.vin && (
                        <p className="text-sm text-blue-600">
                          VIN: {selectedVehicle.vin}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {formData.assetType !== 'vehicle' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assetDescription">Asset Description</Label>
                    <Input
                      id="assetDescription"
                      value={formData.assetDescription}
                      onChange={(e) => handleInputChange('assetDescription', e.target.value)}
                      placeholder="Enter asset description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assetModel">Model/Type</Label>
                    <Input
                      id="assetModel"
                      value={formData.assetModel}
                      onChange={(e) => handleInputChange('assetModel', e.target.value)}
                      placeholder="Enter model or type"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="assetSerial">Serial Number/Identifier</Label>
                    <Input
                      id="assetSerial"
                      value={formData.assetSerial}
                      onChange={(e) => handleInputChange('assetSerial', e.target.value)}
                      placeholder="Enter serial number or identifier"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Order Details */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Work Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the work to be performed..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or special instructions..."
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {selectedCustomer && (
        <div className="flex justify-end gap-3">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.description.trim()}
            size="lg"
          >
            {isSubmitting ? "Creating..." : "Create Work Order"}
          </Button>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <AddVehicleDialog
              customerId={selectedCustomer.id}
              onClose={() => setShowAddVehicleDialog(false)}
              onVehicleAdded={handleAddVehicle}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
