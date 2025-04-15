
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Car, PenLine, HistoryIcon, FileClock } from 'lucide-react';
import { getVehicleById } from '@/utils/vehicleUtils';
import { VehicleDetailCard } from './VehicleDetailCard';
import { VehicleDetailHeader } from './VehicleDetailHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { getCustomerById } from '@/services/customer';

export function VehicleDetailsPage() {
  const { customerId, vehicleId } = useParams<{ customerId: string, vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      // First validate that we have both IDs
      if (!customerId) {
        console.error('Missing customer ID in URL params');
        setError('Missing customer ID. Please return to the customers list and try again.');
        setLoading(false);
        return;
      }

      if (!vehicleId) {
        console.error('Missing vehicle ID in URL params');
        setError('Missing vehicle ID. Please return to the customer details and try again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch vehicle data
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .eq('customer_id', customerId)
          .single();

        if (vehicleError) {
          console.error('Error fetching vehicle:', vehicleError);
          throw new Error('Failed to load vehicle information');
        }
        
        if (!vehicleData) {
          throw new Error('Vehicle not found');
        }
        
        setVehicle(vehicleData as Vehicle);
        
        // Fetch customer data to display name
        const customerData = await getCustomerById(customerId);
        if (customerData) {
          setCustomer(customerData);
        }
        
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vehicle information');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [customerId, vehicleId]);

  const handleBackClick = () => {
    if (customerId) {
      navigate(`/customers/${customerId}`);
    } else {
      navigate('/customers');
    }
  };

  const handleEditClick = () => {
    if (customerId) {
      navigate(`/customers/${customerId}/edit?tab=vehicles&vehicleId=${vehicleId}`);
    }
  };

  // Determine customer name for display
  const customerName = customer ? 
    `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 
    'Unknown Customer';

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customer
        </Button>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vehicle Details</h1>
          <Button onClick={handleEditClick}>
            <PenLine className="mr-2 h-4 w-4" />
            Edit Vehicle
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4">
            <Button onClick={handleBackClick} variant="outline">
              Return to Customer
            </Button>
          </div>
        </Alert>
      ) : vehicle ? (
        <>
          {/* Use the enhanced VehicleDetailHeader component */}
          <VehicleDetailHeader 
            vehicle={vehicle} 
            customerName={customerName}
            customerId={customerId || ''}
          />
          
          <div className="mt-6">
            <Tabs defaultValue="workOrders" className="w-full">
              <TabsList>
                <TabsTrigger value="workOrders">
                  <FileClock className="mr-2 h-4 w-4" />
                  Work Orders
                </TabsTrigger>
                <TabsTrigger value="serviceHistory">
                  <HistoryIcon className="mr-2 h-4 w-4" />
                  Service History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="workOrders">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Orders</CardTitle>
                    <CardDescription>
                      All work orders related to this vehicle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      No work orders found for this vehicle
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => navigate(`/work-orders/new?vehicleId=${vehicleId}&vehicleInfo=${vehicle.year} ${vehicle.make} ${vehicle.model}&customerId=${customerId}`)}>
                      Create New Work Order
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="serviceHistory">
                <Card>
                  <CardHeader>
                    <CardTitle>Service History</CardTitle>
                    <CardDescription>
                      Service history for this vehicle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      No service history records found
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <Alert>
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No vehicle information available</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
