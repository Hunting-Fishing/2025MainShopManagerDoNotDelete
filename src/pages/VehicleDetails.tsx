
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, MessageSquare, Calendar, Wrench, List, Info, FileSpreadsheet, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CustomerVehicle } from "@/types/customer";
import { VehicleDetailHeader } from "@/components/customers/vehicles/VehicleDetailHeader";
import { VehicleServiceHistory } from "@/components/customers/vehicles/VehicleServiceHistory";
import { VehicleInteractions } from "@/components/customers/vehicles/VehicleInteractions";
import { VehicleNotes } from "@/components/customers/vehicles/VehicleNotes";
import { VehicleCommunications } from "@/components/customers/vehicles/VehicleCommunications";
import { VehicleWorkOrders } from "@/components/customers/vehicles/VehicleWorkOrders";
import { VehicleInspections } from "@/components/customers/vehicles/VehicleInspections";
import { VehicleInvoices } from "@/components/customers/vehicles/VehicleInvoices";
import { VehicleRecommendations } from "@/components/customers/vehicles/VehicleRecommendations";
import { VehicleReports } from "@/components/customers/vehicles/VehicleReports";

export default function VehicleDetails() {
  const { customerId, vehicleId } = useParams<{ customerId: string, vehicleId: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<CustomerVehicle | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!vehicleId || !customerId) return;
      
      try {
        // Fetch the vehicle details
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .single();

        if (vehicleError) {
          console.error("Error fetching vehicle:", vehicleError);
          return;
        }

        if (vehicleData) {
          setVehicle(vehicleData);
        }

        // Fetch customer name
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('first_name, last_name')
          .eq('id', customerId)
          .single();

        if (customerError) {
          console.error("Error fetching customer:", customerError);
        } else if (customerData) {
          setCustomerName(`${customerData.first_name} ${customerData.last_name}`);
        }
      } catch (error) {
        console.error("Error in fetchVehicleDetails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [vehicleId, customerId]);

  const handleBack = () => {
    navigate(`/customers/${customerId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading vehicle details...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col space-y-4 items-center justify-center h-40">
        <div className="text-lg text-slate-500">Vehicle not found</div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button onClick={handleBack} variant="ghost" className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer
        </Button>
        <h1 className="text-2xl font-bold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
      </div>

      <VehicleDetailHeader vehicle={vehicle} customerName={customerName} customerId={customerId} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-5 md:grid-cols-10 gap-2">
          <TabsTrigger value="overview" className="flex flex-col items-center px-3 py-2">
            <Info className="h-4 w-4 mb-1" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="service" className="flex flex-col items-center px-3 py-2">
            <Wrench className="h-4 w-4 mb-1" />
            <span className="text-xs">Service</span>
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex flex-col items-center px-3 py-2">
            <MessageSquare className="h-4 w-4 mb-1" />
            <span className="text-xs">Interactions</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex flex-col items-center px-3 py-2">
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-xs">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex flex-col items-center px-3 py-2">
            <MessageSquare className="h-4 w-4 mb-1" />
            <span className="text-xs">Comms</span>
          </TabsTrigger>
          <TabsTrigger value="workOrders" className="flex flex-col items-center px-3 py-2">
            <List className="h-4 w-4 mb-1" />
            <span className="text-xs">Work Orders</span>
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex flex-col items-center px-3 py-2">
            <Calendar className="h-4 w-4 mb-1" />
            <span className="text-xs">Inspections</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex flex-col items-center px-3 py-2">
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-xs">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex flex-col items-center px-3 py-2">
            <Wrench className="h-4 w-4 mb-1" />
            <span className="text-xs">Recommended</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex flex-col items-center px-3 py-2">
            <BarChart3 className="h-4 w-4 mb-1" />
            <span className="text-xs">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Year:</span>
                  <span className="font-medium">{vehicle.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Make:</span>
                  <span className="font-medium">{vehicle.make || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model:</span>
                  <span className="font-medium">{vehicle.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">VIN:</span>
                  <span className="font-medium font-mono text-sm">{vehicle.vin || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">License Plate:</span>
                  <span className="font-medium">{vehicle.license_plate || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color:</span>
                  <span className="font-medium">{vehicle.color || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Service Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Service:</span>
                  <span className="font-medium">
                    {vehicle.last_service_date 
                      ? new Date(vehicle.last_service_date).toLocaleDateString() 
                      : 'No service history'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Owner Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="service" className="mt-6">
          <VehicleServiceHistory vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="interactions" className="mt-6">
          <VehicleInteractions vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <VehicleNotes vehicleId={vehicleId} customerId={customerId} />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <VehicleCommunications vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="workOrders" className="mt-6">
          <VehicleWorkOrders vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="inspections" className="mt-6">
          <VehicleInspections vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <VehicleInvoices vehicleId={vehicleId} />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <VehicleRecommendations vehicle={vehicle} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <VehicleReports vehicleId={vehicleId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
