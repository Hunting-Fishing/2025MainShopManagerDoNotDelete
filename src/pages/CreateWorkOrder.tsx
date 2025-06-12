
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createWorkOrder } from '@/services/workOrder';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateWorkOrder = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extract pre-populated data from URL parameters
  const prePopulatedData = {
    customerId: searchParams.get('customerId') || undefined,
    customerName: searchParams.get('customerName') || undefined,
    customerEmail: searchParams.get('customerEmail') || undefined,
    customerPhone: searchParams.get('customerPhone') || undefined,
    customerAddress: searchParams.get('customerAddress') || undefined,
    vehicleMake: searchParams.get('vehicleMake') || undefined,
    vehicleModel: searchParams.get('vehicleModel') || undefined,
    vehicleYear: searchParams.get('vehicleYear') || undefined,
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate') || undefined,
    vehicleVin: searchParams.get('vehicleVin') || undefined,
  };

  const handleCreateWorkOrder = async (workOrderData: any) => {
    try {
      console.log('Creating work order with data:', workOrderData);
      
      const newWorkOrder = await createWorkOrder(workOrderData);
      
      toast({
        title: 'Success',
        description: 'Work order created successfully!',
      });

      // Navigate to the created work order details page
      navigate(`/work-orders/${newWorkOrder.id}`);
      
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Work Order</h1>
              <p className="text-sm text-gray-600 mt-1">
                Use the comprehensive work order interface to create detailed work orders
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer maxWidth="full" className="py-6">
        <WorkOrderDetailsView 
          workOrderId="new"
          isCreateMode={true}
          prePopulatedData={prePopulatedData}
          onCreateWorkOrder={handleCreateWorkOrder}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default CreateWorkOrder;
