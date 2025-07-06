
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { useToast } from '@/hooks/use-toast';
import { createWorkOrder } from '@/services/workOrder';
import { WorkOrderForm } from '@/components/work-orders/WorkOrderForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WorkOrderCreate = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extract and clean up pre-populated data from URL parameters
  const prePopulatedData = {
    customerId: searchParams.get('customerId') || undefined,
    customerName: searchParams.get('customerName') || undefined,
    customerEmail: searchParams.get('customerEmail') || undefined,
    customerPhone: searchParams.get('customerPhone') || undefined,
    customerAddress: searchParams.get('customerAddress') || undefined,
    customerCity: searchParams.get('customerCity') || undefined,
    customerState: searchParams.get('customerState') || undefined,
    customerZip: searchParams.get('customerZip') || undefined,
    vehicleId: searchParams.get('vehicleId') || undefined,
    vehicleMake: searchParams.get('vehicleMake') || undefined,
    vehicleModel: searchParams.get('vehicleModel') || undefined,
    vehicleYear: searchParams.get('vehicleYear') || undefined,
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate') || undefined,
    vehicleVin: searchParams.get('vehicleVin') || undefined,
  };

  // Filter out empty strings and convert to undefined
  const cleanedData = Object.fromEntries(
    Object.entries(prePopulatedData)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([key, value]) => [key, decodeURIComponent(value as string)])
  );

  console.log('Pre-populated data from URL:', cleanedData);

  const handleCreateWorkOrder = async (workOrderData: any) => {
    try {
      console.log('=== WORK ORDER CREATION DEBUG ===');
      console.log('1. Form data received:', workOrderData);
      console.log('2. Pre-populated data:', cleanedData);
      
      // Add customer/vehicle IDs from URL if available
      const enrichedData = {
        ...workOrderData,
        customerId: workOrderData.customerId || cleanedData.customerId,
        vehicleId: workOrderData.vehicleId || cleanedData.vehicleId,
      };
      
      console.log('3. Enriched data being sent to service:', enrichedData);
      
      const newWorkOrder = await createWorkOrder(enrichedData);
      
      console.log('4. Work order created successfully:', newWorkOrder);
      
      toast({
        title: 'Success',
        description: 'Work order created successfully!',
      });

      // Navigate to the created work order details page
      navigate(`/work-orders/${newWorkOrder.id}`);
      
    } catch (error) {
      console.error('=== WORK ORDER CREATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', (error as Error)?.message);
      console.error('Error stack:', (error as Error)?.stack);
      
      toast({
        title: 'Error',
        description: `Failed to create work order: ${(error as Error)?.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
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
              <h1 className="text-3xl font-bold text-gray-900">Create New Work Order</h1>
              <p className="text-sm text-gray-600 mt-1">
                {cleanedData.customerName 
                  ? `Creating work order for ${cleanedData.customerName}` 
                  : 'Create a comprehensive work order with customer and vehicle details'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer maxWidth="full" className="py-6">
        <WorkOrderForm
          onSubmit={handleCreateWorkOrder}
          prePopulatedCustomer={cleanedData}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default WorkOrderCreate;
