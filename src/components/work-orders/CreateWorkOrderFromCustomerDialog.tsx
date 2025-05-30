
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { CustomerEquipmentSelector, SelectedEquipment } from './customer-select/CustomerEquipmentSelector';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, Phone, Mail } from 'lucide-react';

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
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handleSelectEquipment = (equipment: SelectedEquipment) => {
    setSelectedEquipment(equipment);
    setStep('confirm');
  };

  const handleAddNewEquipment = () => {
    // For now, redirect to the work order creation page
    const customerName = `${customer.first_name} ${customer.last_name}`;
    navigate(`/work-orders/create?customerId=${customer.id}&customerName=${encodeURIComponent(customerName)}`);
    onOpenChange(false);
  };

  const handleCreateWorkOrder = () => {
    const customerName = `${customer.first_name} ${customer.last_name}`;
    
    // Build query parameters with all the customer and equipment information
    const params = new URLSearchParams({
      customerId: customer.id,
      customerName: customerName,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: customer.address || ''
    });

    if (selectedEquipment) {
      params.append('equipmentType', selectedEquipment.type);
      params.append('equipmentName', selectedEquipment.name);
      if (selectedEquipment.id) {
        params.append('equipmentId', selectedEquipment.id);
      }
      
      // Add vehicle/equipment specific details
      Object.entries(selectedEquipment.details).forEach(([key, value]) => {
        if (value) {
          params.append(`equipment_${key}`, value.toString());
        }
      });
    }

    navigate(`/work-orders/create?${params.toString()}`);
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep('select');
    setSelectedEquipment(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Create Work Order' : 'Confirm Work Order Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6">
            {/* Customer Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                    {customer.company && (
                      <div className="text-muted-foreground">{customer.company}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Selection */}
            <CustomerEquipmentSelector
              customer={customer}
              onSelectEquipment={handleSelectEquipment}
              onAddNewEquipment={handleAddNewEquipment}
            />
          </div>
        )}

        {step === 'confirm' && selectedEquipment && (
          <div className="space-y-6">
            {/* Customer Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                  {customer.email && (
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  )}
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Selected Equipment</div>
                  <div className="font-medium">{selectedEquipment.name}</div>
                  {selectedEquipment.details.vin && (
                    <div className="text-sm text-muted-foreground">VIN: {selectedEquipment.details.vin}</div>
                  )}
                  {selectedEquipment.details.license_plate && (
                    <div className="text-sm text-muted-foreground">License: {selectedEquipment.details.license_plate}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleCreateWorkOrder}>
                Create Work Order
              </Button>
            </div>
          </div>
        )}

        {step === 'select' && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
