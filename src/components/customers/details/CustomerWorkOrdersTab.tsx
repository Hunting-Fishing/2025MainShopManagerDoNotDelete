
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types/customer';

interface CustomerWorkOrdersTabProps {
  customer: Customer;
}

export const CustomerWorkOrdersTab: React.FC<CustomerWorkOrdersTabProps> = ({ customer }) => {
  const navigate = useNavigate();

  const handleCreateWorkOrder = () => {
    // Navigate to the main work orders page with customer pre-population
    const params = new URLSearchParams({
      customerId: customer.id,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: customer.address || '',
    });

    // Navigate to the existing work orders page instead of the separate create page
    navigate(`/work-orders?${params.toString()}&action=create`);
  };

  return (
    <div className="space-y-6">
      {/* Work Orders Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Work Orders</h3>
          <p className="text-sm text-muted-foreground">
            Manage service requests and maintenance for this customer
          </p>
        </div>
        <Button onClick={handleCreateWorkOrder} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create First Work Order
        </Button>
      </div>

      {/* Empty State */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <Wrench className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">No work orders yet</h4>
            <p className="text-sm text-gray-500 mt-1">
              Create the first work order for {customer.first_name} {customer.last_name} to get started
            </p>
          </div>
          <Button onClick={handleCreateWorkOrder} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>
      </div>
    </div>
  );
};
