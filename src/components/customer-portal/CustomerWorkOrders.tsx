
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkOrder, priorityMap } from "@/types/workOrder";
import { formatDate } from "@/utils/workOrderUtils";
import { Wrench, Search, Info, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { printElement } from "@/utils/printUtils";

interface CustomerWorkOrdersProps {
  customerId?: string;
}

export function CustomerWorkOrders({ customerId }: CustomerWorkOrdersProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  
  useEffect(() => {
    async function fetchWorkOrders() {
      if (!customerId) return;
      
      try {
        const { data, error } = await supabase
          .from("work_orders")
          .select("*, vehicles(*)")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Map the data to match the WorkOrder type
        const mappedWorkOrders = (data || []).map(wo => ({
          id: wo.id,
          customer: wo.customer_id || "",
          customerId: wo.customer_id || "",
          description: wo.description || "",
          status: wo.status || "pending",
          priority: wo.priority || "medium",
          technician: wo.technician || "",
          technicianId: wo.technician_id || "",
          date: wo.created_at || new Date().toISOString(),
          dueDate: wo.end_time || new Date().toISOString(),
          location: "",
          // Include additional fields from the database
          vehicles: wo.vehicles || [],
          vehicleId: wo.vehicle_id,
          // Handle date fields
          start_time: wo.start_time,
          createdAt: wo.created_at,
          updatedAt: wo.updated_at
        }));
        
        setWorkOrders(mappedWorkOrders);
      } catch (err) {
        console.error("Error fetching work orders:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWorkOrders();
  }, [customerId]);
  
  // Filter work orders based on search term and status
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = searchTerm.trim() === '' || 
      wo.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === null || wo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle print work order
  const handlePrintWorkOrder = (workOrder: WorkOrder) => {
    printElement(
      'work-order-details', 
      `Work Order ${workOrder.id.substring(0, 8)}`
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (workOrders.length === 0) {
    return (
      <div className="text-center p-8">
        <Wrench className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Work Orders Found</h3>
        <p className="text-gray-500 mb-4">
          You don't have any work orders in our system yet.
        </p>
        <Button>Contact Us for Assistance</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "in-progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("in-progress")}
          >
            In Progress
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders.map((wo) => (
              <TableRow key={wo.id}>
                <TableCell className="font-mono">{wo.id.substring(0, 8)}</TableCell>
                <TableCell>{wo.description}</TableCell>
                <TableCell>
                  {wo.vehicles && wo.vehicles.length > 0 ? 
                    `${wo.vehicles[0].year} ${wo.vehicles[0].make} ${wo.vehicles[0].model}` : 
                    "N/A"}
                </TableCell>
                <TableCell>{formatDate(wo.start_time || wo.createdAt || wo.date)}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    wo.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : wo.status === 'in-progress' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {wo.status.charAt(0).toUpperCase() + wo.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mr-2"
                        onClick={() => setSelectedWorkOrder(wo)}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl" id="work-order-details">
                      <DialogHeader>
                        <DialogTitle>Work Order Details</DialogTitle>
                      </DialogHeader>
                      {selectedWorkOrder && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h2 className="text-xl font-semibold mb-1">
                                Work Order #{selectedWorkOrder.id.substring(0, 8)}
                              </h2>
                              <p className="text-gray-500">
                                Created: {formatDate(selectedWorkOrder.createdAt || selectedWorkOrder.date)}
                              </p>
                            </div>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handlePrintWorkOrder(selectedWorkOrder)}
                            >
                              <Download className="h-4 w-4" />
                              Download PDF
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <p className="mt-1">{selectedWorkOrder.description}</p>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                  selectedWorkOrder.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : selectedWorkOrder.status === 'in-progress' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {selectedWorkOrder.status.charAt(0).toUpperCase() + selectedWorkOrder.status.slice(1)}
                                </span>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                  priorityMap[selectedWorkOrder.priority as keyof typeof priorityMap]?.classes || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {priorityMap[selectedWorkOrder.priority as keyof typeof priorityMap]?.label || 'Medium'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                                <p className="mt-1">
                                  {selectedWorkOrder.vehicles && selectedWorkOrder.vehicles.length > 0 ? 
                                    `${selectedWorkOrder.vehicles[0].year} ${selectedWorkOrder.vehicles[0].make} ${selectedWorkOrder.vehicles[0].model}` : 
                                    "N/A"}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                                  <p className="mt-1">
                                    {selectedWorkOrder.start_time ? 
                                      formatDate(selectedWorkOrder.start_time) : 
                                      "Not scheduled"}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                                  <p className="mt-1">
                                    {selectedWorkOrder.dueDate ? 
                                      formatDate(selectedWorkOrder.dueDate) : 
                                      "Not specified"}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">Assigned Technician</h3>
                                <p className="mt-1">{selectedWorkOrder.technician || "Not assigned"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {filteredWorkOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No matching work orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
