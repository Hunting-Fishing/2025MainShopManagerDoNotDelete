
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ClipboardList, Edit, FilePlus, AlertTriangle, Clock } from "lucide-react";
import { WorkOrder, priorityMap, statusMap } from "@/data/workOrdersData";
import { toast } from "@/components/ui/use-toast";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderExportMenu } from "./WorkOrderExportMenu";

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export default function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>(workOrder);

  // Get status and priority info
  const statusInfo = statusMap[workOrder.status as keyof typeof statusMap];
  const priorityInfo = priorityMap[workOrder.priority as keyof typeof priorityMap];

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle creating invoice
  const handleCreateInvoice = () => {
    navigate(`/invoices/create/${workOrder.id}`);
  };

  // Handle edit work order
  const handleEditWorkOrder = () => {
    navigate(`/work-orders/${workOrder.id}/edit`);
  };

  // Handle updating time entries
  const handleUpdateTimeEntries = (timeEntries: TimeEntry[]) => {
    // Calculate total billable time
    const totalBillableTime = timeEntries.reduce((total, entry) => {
      return entry.billable ? total + entry.duration : total;
    }, 0);

    // Update work order with new time entries
    const updatedWorkOrder = {
      ...currentWorkOrder,
      timeEntries,
      totalBillableTime
    };

    setCurrentWorkOrder(updatedWorkOrder);

    // In a real app, you would save this to the backend
    console.log("Updated work order with time entries:", updatedWorkOrder);

    // Show success message
    toast({
      title: "Time Entries Updated",
      description: "Time entries have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{workOrder.id}</h1>
          <div className="flex items-center mt-2 space-x-4">
            {/* Status badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              workOrder.status === "completed" ? "bg-green-100 text-green-800" : 
              workOrder.status === "in-progress" ? "bg-blue-100 text-blue-800" :
              workOrder.status === "pending" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {statusInfo}
            </span>
            
            {/* Priority badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.classes}`}>
              {priorityInfo.label} Priority
            </span>
            
            {/* Date */}
            <span className="inline-flex items-center text-sm text-slate-500">
              <CalendarIcon className="mr-1 h-4 w-4" />
              Created: {formatDate(workOrder.date)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <WorkOrderExportMenu workOrder={currentWorkOrder} />
          <Button variant="outline" onClick={handleEditWorkOrder}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Work Order
          </Button>
          <Button onClick={handleCreateInvoice}>
            <FilePlus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">
            <ClipboardList className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="time-tracking">
            <Clock className="mr-2 h-4 w-4" />
            Time Tracking
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          {/* Work Order Details */}
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Work Order Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Customer</h3>
                  <p className="mt-1">{workOrder.customer}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Location</h3>
                  <p className="mt-1">{workOrder.location}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Description</h3>
                  <p className="mt-1">{workOrder.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Technician</h3>
                  <p className="mt-1">{workOrder.technician}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Created On</h3>
                  <p className="mt-1">{formatDate(workOrder.date)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Due Date</h3>
                  <p className="mt-1">{formatDate(workOrder.dueDate)}</p>
                </div>
              </div>
              
              {workOrder.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-500">Notes</h3>
                  <p className="mt-1 whitespace-pre-wrap">{workOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Inventory Items */}
          {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 ? (
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Inventory Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {workOrder.inventoryItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Inventory Items</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-slate-500">No inventory items added to this work order</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="time-tracking">
          <TimeTrackingSection 
            workOrderId={currentWorkOrder.id}
            timeEntries={currentWorkOrder.timeEntries || []}
            onUpdateTimeEntries={handleUpdateTimeEntries}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
