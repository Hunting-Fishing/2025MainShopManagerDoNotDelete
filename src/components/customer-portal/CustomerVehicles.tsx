
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerVehicle } from "@/types/customer";
import { supabase } from "@/lib/supabase";
import { getVehicleDisplayName } from "@/types/customer/vehicle";
import { Car, Calendar, Download, FileText, Wrench } from "lucide-react";

interface CustomerVehiclesProps {
  customerId?: string;
}

export function CustomerVehicles({ customerId }: CustomerVehiclesProps) {
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchVehicles() {
      if (!customerId) return;
      
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("customer_id", customerId);
          
        if (error) throw error;
        
        setVehicles(data || []);
        
        // Select the first vehicle by default if available
        if (data && data.length > 0) {
          setSelectedVehicle(data[0].id);
          fetchVehicleServiceHistory(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchVehicles();
  }, [customerId]);
  
  async function fetchVehicleServiceHistory(vehicleId: string) {
    try {
      // Fetch work orders related to this vehicle
      const { data: workOrders, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setServiceHistory(workOrders || []);
    } catch (err) {
      console.error("Error fetching vehicle service history:", err);
      setServiceHistory([]);
    }
  }
  
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    fetchVehicleServiceHistory(vehicleId);
  };
  
  const handleDownloadServiceHistory = () => {
    // In a real implementation, this would generate and download 
    // a PDF of the selected vehicle's service history
    alert("This would download the service history as a PDF");
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (vehicles.length === 0) {
    return (
      <div className="text-center p-8">
        <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Vehicles Found</h3>
        <p className="text-gray-500 mb-4">
          You don't have any vehicles linked to your account yet.
        </p>
        <Button>Contact Us to Add a Vehicle</Button>
      </div>
    );
  }
  
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

  return (
    <div className="space-y-6">
      {/* Vehicle Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className={`cursor-pointer transition-all ${
              selectedVehicle === vehicle.id 
                ? "border-blue-500 shadow-md bg-blue-50" 
                : "hover:border-blue-300"
            }`}
            onClick={() => handleVehicleSelect(vehicle.id!)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Car className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-medium">{getVehicleDisplayName(vehicle)}</h3>
                  <p className="text-sm text-gray-600">
                    {vehicle.vin ? `VIN: ${vehicle.vin}` : "No VIN recorded"}
                  </p>
                  {vehicle.license_plate && (
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 mt-1 rounded">
                      {vehicle.license_plate}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Vehicle Details */}
      {selectedVehicleData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Vehicle Details</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleDownloadServiceHistory}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download History</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Book Service</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Vehicle Info</TabsTrigger>
                <TabsTrigger value="service">Service History</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Make:</span>
                      <span className="font-medium">{selectedVehicleData.make}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-medium">{selectedVehicleData.model}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Year:</span>
                      <span className="font-medium">{selectedVehicleData.year}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">VIN:</span>
                      <span className="font-medium font-mono text-sm">{selectedVehicleData.vin || "N/A"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">License Plate:</span>
                      <span className="font-medium">{selectedVehicleData.license_plate || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Color:</span>
                      <span className="font-medium">{selectedVehicleData.color || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Engine:</span>
                      <span className="font-medium">{selectedVehicleData.engine || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Last Service:</span>
                      <span className="font-medium">
                        {selectedVehicleData.last_service_date 
                          ? new Date(selectedVehicleData.last_service_date).toLocaleDateString() 
                          : "No service record"}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="service">
                {serviceHistory.length === 0 ? (
                  <div className="text-center p-8">
                    <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No Service History</h3>
                    <p className="text-gray-500">
                      This vehicle doesn't have any service records yet.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-2 p-3 font-medium bg-gray-50 border-b">
                      <div className="col-span-3">Date</div>
                      <div className="col-span-6">Service</div>
                      <div className="col-span-3">Status</div>
                    </div>
                    {serviceHistory.map((record) => (
                      <div key={record.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0">
                        <div className="col-span-3">
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                        <div className="col-span-6">{record.description || "General Service"}</div>
                        <div className="col-span-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : record.status === 'in-progress' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.status === 'completed' 
                              ? 'Completed' 
                              : record.status === 'in-progress'
                                ? 'In Progress'
                                : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Request Full Service Report
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
