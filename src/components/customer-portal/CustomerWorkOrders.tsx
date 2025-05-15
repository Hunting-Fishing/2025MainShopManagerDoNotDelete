
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { formatDate } from "@/utils/dateUtils";
import { WorkOrder, statusMap, priorityMap } from "@/types";

export function CustomerWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { userId } = useAuthUser();

  useEffect(() => {
    const fetchWorkOrders = async () => {
      if (!userId) return;
      setIsLoading(true);

      try {
        // Fetch work orders for the current customer with their vehicle info
        const { data: workOrdersData, error } = await supabase
          .from('work_orders')
          .select(`
            id, description, status, priority, 
            technician_id, start_time, end_time, vehicle_id, created_at, updated_at
          `)
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (workOrdersData) {
          // Need to transform the data to match our WorkOrder type
          const transformedOrders: WorkOrder[] = workOrdersData.map(order => ({
            id: order.id,
            customer: "", // This will be filled in from the customer table if needed
            description: order.description || "",
            status: order.status || "pending",
            priority: order.priority || "medium",
            technician: "", // This will be filled in from profiles table if needed
            technicianId: order.technician_id,
            date: order.created_at || "",
            dueDate: order.end_time || "",
            location: "", // This field is required by WorkOrder but might not be in DB
            vehicleId: order.vehicle_id,
            createdAt: order.created_at,
            updatedAt: order.updated_at
          }));
          
          setWorkOrders(transformedOrders);
        }
      } catch (error) {
        console.error("Error fetching work orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, [userId]);

  // Filter work orders based on search term and status filter
  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch =
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <h2 className="text-2xl font-semibold">My Work Orders</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
            <Input
              placeholder="Search work orders..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkOrders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-6">
          <Wrench className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium">No work orders found</h3>
          <p className="text-gray-500 text-center mt-1 max-w-md">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search filters"
              : "When you have service work done, your work orders will appear here"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWorkOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium truncate">
                      {order.description || `Work Order #${order.id.substring(0, 8)}`}
                    </h3>
                    <Badge
                      className={priorityMap[order.priority].classes}
                    >
                      {priorityMap[order.priority].label}
                    </Badge>
                  </div>
                  
                  <div className="text-gray-500 text-sm mb-3">
                    <div className="flex gap-2 items-center">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created: {formatDate(order.date || "")}</span>
                    </div>
                    {order.dueDate && (
                      <div className="flex gap-2 items-center">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Due: {formatDate(order.dueDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-between items-center">
                    <Badge variant="outline" className="bg-white">
                      {statusMap[order.status] || order.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 sm:mt-0"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Work Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        {selectedOrder && (
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedOrder.description || `Work Order #${selectedOrder.id.substring(0, 8)}`}
              </DialogTitle>
              <DialogDescription>
                <Badge className={priorityMap[selectedOrder.priority].classes}>
                  {priorityMap[selectedOrder.priority].label} Priority
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{statusMap[selectedOrder.status] || selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created Date</p>
                  <p>{formatDate(selectedOrder.date || "")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p>{selectedOrder.dueDate ? formatDate(selectedOrder.dueDate) : "Not set"}</p>
                </div>
              </div>
              
              {selectedOrder.technicianId && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Technician</p>
                  <p>{selectedOrder.technician || "Assigned technician"}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <Button className="w-full" variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
