
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Wrench, FileText, Clock, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkOrder } from "@/types/workOrder";

interface CustomerWorkOrdersProps {
  customerId?: string;
}

const CustomerWorkOrders: React.FC<CustomerWorkOrdersProps> = ({ customerId }) => {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    async function fetchWorkOrders() {
      if (!customerId) {
        console.log("No customer ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("work_orders")
          .select(`
            *,
            vehicles:vehicle_id (
              make,
              model,
              year
            )
          `)
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching work orders:", error);
          throw error;
        }

        console.log("Fetched work orders:", data);
        setWorkOrders(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkOrders();
  }, [customerId]);

  const openWorkOrderDetails = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setViewDetailsOpen(true);
  };

  const activeWorkOrders = workOrders.filter(
    (wo) => !["completed", "cancelled", "invoiced"].includes(wo.status)
  );
  const completedWorkOrders = workOrders.filter((wo) =>
    ["completed", "cancelled", "invoiced"].includes(wo.status)
  );

  function getStatusBadgeColor(status: string) {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      case "invoiced":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  }

  const renderWorkOrderList = (workOrders: any[]) => {
    if (workOrders.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No work orders found.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => {
            // Extract vehicle information safely
            const vehicleInfo = workOrder.vehicles || {};
            const make = vehicleInfo.make || "Unknown";
            const model = vehicleInfo.model || "Unknown";
            const year = vehicleInfo.year || "";
            
            // Format the start date
            const startDate = workOrder.start_time 
              ? formatDate(workOrder.start_time) 
              : formatDate(workOrder.created_at);

            return (
              <TableRow key={workOrder.id}>
                <TableCell>{startDate}</TableCell>
                <TableCell>{year} {make} {model}</TableCell>
                <TableCell>
                  {workOrder.description || workOrder.service_type || "General Service"}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(workOrder.status)}>
                    {workOrder.status || "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWorkOrderDetails(workOrder)}
                    className="flex items-center gap-1"
                  >
                    Details <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] mb-6">
          <TabsTrigger value="active">
            Active ({activeWorkOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedWorkOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">
                Active Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent>{renderWorkOrderList(activeWorkOrders)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">
                Completed Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent>{renderWorkOrderList(completedWorkOrders)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Vehicle Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkOrder.vehicles?.year || ""} {selectedWorkOrder.vehicles?.make || "Unknown"} {selectedWorkOrder.vehicles?.model || "Unknown"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {selectedWorkOrder.service_type || "General Service"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {selectedWorkOrder.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      Started on {formatDate(selectedWorkOrder.start_time || selectedWorkOrder.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Current Status</h3>
                <Badge className={getStatusBadgeColor(selectedWorkOrder.status) + " text-sm px-3 py-1"}>
                  {selectedWorkOrder.status || "Pending"}
                </Badge>
                {selectedWorkOrder.status === "completed" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Completed on{" "}
                    {formatDate(selectedWorkOrder.end_time)}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerWorkOrders;
