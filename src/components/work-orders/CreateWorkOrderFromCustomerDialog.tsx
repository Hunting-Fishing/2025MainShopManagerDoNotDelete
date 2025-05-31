
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Customer, getCustomerFullName } from '@/types/customer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { fetchEquipment } from '@/services/equipmentService';
import { Equipment } from '@/types/equipment';

interface CreateWorkOrderFromCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkOrderFromCustomerDialog: React.FC<CreateWorkOrderFromCustomerDialogProps> = ({
  customer,
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [customerEquipment, setCustomerEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadCustomerEquipment();
    }
  }, [open, customer.id]);

  const loadCustomerEquipment = async () => {
    setLoading(true);
    try {
      const allEquipment = await fetchEquipment();
      // Filter equipment for this specific customer
      const customerEquip = allEquipment.filter(eq => 
        eq.customer === getCustomerFullName(customer) ||
        eq.customer === customer.id
      );
      setCustomerEquipment(customerEquip);
    } catch (error) {
      console.error('Error loading customer equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    setIsCreating(true);
    
    try {
      const customerName = getCustomerFullName(customer);
      const queryParams = new URLSearchParams({
        customerId: customer.id,
        customerName: customerName,
        customerEmail: customer.email || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || ''
      });

      // Add selected equipment data if available
      if (selectedEquipment) {
        const equipment = customerEquipment.find(eq => eq.id === selectedEquipment);
        if (equipment) {
          queryParams.set('equipmentName', equipment.name);
          queryParams.set('equipmentType', equipment.category);
        }
      }

      // Add selected vehicle data if available
      if (selectedVehicle && customer.vehicles) {
        const vehicle = customer.vehicles.find(v => v.id === selectedVehicle);
        if (vehicle) {
          queryParams.set('vehicleMake', vehicle.make || '');
          queryParams.set('vehicleModel', vehicle.model || '');
          queryParams.set('vehicleYear', vehicle.year?.toString() || '');
          queryParams.set('vehicleLicensePlate', vehicle.license_plate || '');
          queryParams.set('vehicleVin', vehicle.vin || '');
        }
      }

      // Navigate to work order creation with pre-populated data
      navigate(`/work-orders/create?${queryParams.toString()}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating work order:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a new work order for {getCustomerFullName(customer)}
          </p>

          {/* Vehicle Selection */}
          {customer.vehicles && customer.vehicles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Select Vehicle (Optional)</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {customer.vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id || 'no-id'} value={vehicle.id || ''}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                      {vehicle.license_plate && ` - ${vehicle.license_plate}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Equipment Selection */}
          <div className="space-y-2">
            <Label htmlFor="equipment-select">Select Equipment/Asset (Optional)</Label>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading equipment...</div>
            ) : customerEquipment.length > 0 ? (
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose equipment..." />
                </SelectTrigger>
                <SelectContent>
                  {customerEquipment.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {equipment.name} - {equipment.category}
                      {equipment.model && ` (${equipment.model})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No equipment found for this customer
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkOrder}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Work Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
