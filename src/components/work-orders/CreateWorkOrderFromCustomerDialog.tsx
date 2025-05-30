
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Customer, getCustomerFullName } from '@/types/customer';

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

      // Navigate to work order creation with pre-populated customer data
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
