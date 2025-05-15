
import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WorkOrder } from "@/types/workOrder";
import { formatDate } from "@/utils/workOrders";
import { Skeleton } from "@/components/ui/skeleton";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CustomerWorkOrders({ customerId }: { customerId?: string }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleDetails, setVehicleDetails] = useState<{[key: string]: {make: string, model: string, year: string | number}}>({}); 

  useEffect(() => {
    async function fetchWorkOrders() {
      if (!customerId) return;

      try {
        setIsLoading(true);
        
        // Fetch work orders for this customer
        const { data: orderData, error: orderError } = await supabase
          .from("work_orders")
          .select("*")
          .eq("customer_id", customerId);

        if (orderError) {
          throw orderError;
        }

        // Fetch vehicle information for these work orders
        const vehicleIds = orderData
          .map(order => order.vehicle_id)
          .filter((id): id is string => !!id);
        
        // If there are vehicle IDs, fetch their details
        if (vehicleIds.length > 0) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from("vehicles")
            .select("id, make, model, year")
            .in("id", vehicleIds);

          if (vehicleError) {
            throw vehicleError;
          }

          // Create a mapping of vehicle IDs to their details
          const vehicleMap: {[key: string]: {make: string, model: string, year: string | number}} = {};
          vehicleData?.forEach(vehicle => {
            if (vehicle.id) {
              vehicleMap[vehicle.id] = {
                make: vehicle.make || '',
                model: vehicle.model || '',
                year: vehicle.year || ''
              };
            }
          });

          setVehicleDetails(vehicleMap);
        }

        setWorkOrders(orderData || []);
      } catch (error) {
        console.error("Error fetching customer work orders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkOrders();
  }, [customerId]);

  const printWorkOrders = () => {
    const element = document.getElementById("workOrdersTable");
    if (!element) return;
    
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("work-orders.pdf");
    });
  };

  const downloadWorkOrders = () => {
    // Create CSV content
    const headers = ["Date", "Service", "Status", "Vehicle", "Notes"];
    const rows = workOrders.map((order) => [
      formatDate(order.date),
      order.service_type || "General Service",
      order.status,
      order.vehicle_id && vehicleDetails[order.vehicle_id] 
        ? `${vehicleDetails[order.vehicle_id].year} ${vehicleDetails[order.vehicle_id].make} ${vehicleDetails[order.vehicle_id].model}` 
        : "Unknown vehicle",
      order.notes || ""
    ]);

    const csvContent = 
      [headers]
        .concat(rows)
        .map((row) => row.map(cell => `"${cell}"`).join(","))
        .join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "work-orders.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <div className="space-x-2">
            <Skeleton className="h-9 w-24 inline-block" />
            <Skeleton className="h-9 w-24 inline-block" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Work Orders</CardTitle>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={printWorkOrders}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={downloadWorkOrders}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {workOrders.length === 0 ? (
          <div className="text-center p-6">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No work orders found</h3>
            <p className="mt-1 text-gray-500">You don't have any work orders in our system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table id="workOrdersTable">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.service_type || "General Service"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.vehicle_id && vehicleDetails[order.vehicle_id] 
                        ? `${vehicleDetails[order.vehicle_id].year} ${vehicleDetails[order.vehicle_id].make} ${vehicleDetails[order.vehicle_id].model}` 
                        : "Unknown vehicle"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/work-orders/${order.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
