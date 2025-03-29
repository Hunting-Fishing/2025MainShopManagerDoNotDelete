
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Edit, FileText, Trash2, ArrowLeft, Package, History, User, MessageSquare, Plus } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteWorkOrder } from "@/utils/workOrderUtils";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findCustomerById } from "@/data/customersData";
import { CustomerInteraction } from "@/types/interaction";
import { addInteraction, customerInteractions } from "@/data/interactionsData";
import { InteractionsList } from "@/components/interactions/InteractionsList";
import { AddInteractionDialog } from "@/components/interactions/AddInteractionDialog";

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

// Status and priority styling maps
const statusStyleMap: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "completed": "bg-green-100 text-green-800 hover:bg-green-200",
  "cancelled": "bg-red-100 text-red-800 hover:bg-red-200",
};

const priorityStyleMap: Record<string, string> = {
  "low": "bg-slate-100 text-slate-800 hover:bg-slate-200",
  "medium": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "high": "bg-red-100 text-red-800 hover:bg-red-200",
};

export default function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [relatedInteractions, setRelatedInteractions] = useState<CustomerInteraction[]>([]);
  const [customer, setCustomer] = useState(null);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);

  // Parse dates
  const createdDate = parseISO(workOrder.date);
  const dueDate = parseISO(workOrder.dueDate);

  // Fetch customer and related interactions
  useEffect(() => {
    const foundCustomer = findCustomerById(customers => 
      customers.find(c => c.name === workOrder.customer)
    );
    
    if (foundCustomer) {
      setCustomer(foundCustomer);
    }
    
    // Get interactions related to this work order
    const workOrderInteractions = customerInteractions.filter(
      interaction => interaction.relatedWorkOrderId === workOrder.id
    );
    
    setRelatedInteractions(workOrderInteractions);
  }, [workOrder]);

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkOrder(workOrder.id);
      toast({
        title: "Work Order Deleted",
        description: `Work order ${workOrder.id} has been deleted successfully.`,
      });
      navigate("/work-orders");
    } catch (error) {
      console.error("Error deleting work order:", error);
      toast({
        title: "Error",
        description: "Failed to delete work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle adding a new interaction
  const handleInteractionAdded = (interaction: CustomerInteraction) => {
    setRelatedInteractions([interaction, ...relatedInteractions]);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/work-orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Work Order: {workOrder.id}</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Created on {formatDate(createdDate)}
          </p>
        </div>

        <div className="flex space-x-4 ml-10 md:ml-0">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setAddInteractionOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            Record Interaction
          </Button>
          <Button 
            asChild
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Link to={`/invoices/create?workOrder=${workOrder.id}`}>
              <FileText className="h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Link to={`/work-orders/${workOrder.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="interactions">
            Interactions
            {relatedInteractions.length > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-800">{relatedInteractions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-slate-500" />
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/customer-service-history/${encodeURIComponent(workOrder.customer)}`} className="flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    View Service History
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="divide-y">
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Customer</div>
                  <div>{workOrder.customer}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Location</div>
                  <div>{workOrder.location}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Description</div>
                  <div>{workOrder.description}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg">Work Order Details</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Status</div>
                  <div>
                    <Badge className={statusStyleMap[workOrder.status]}>
                      {workOrder.status === "in-progress" ? "In Progress" : 
                        workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Priority</div>
                  <div>
                    <Badge className={priorityStyleMap[workOrder.priority]}>
                      {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Due Date</div>
                  <div>{formatDate(dueDate)}</div>
                </div>
                <div className="py-3 grid grid-cols-1 md:grid-cols-2">
                  <div className="text-sm font-medium text-slate-500">Assigned To</div>
                  <div>{workOrder.technician}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Items */}
          {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 && (
            <Card>
              <CardHeader className="bg-slate-50 border-b flex flex-row items-center">
                <Package className="h-5 w-5 mr-2 text-slate-500" />
                <CardTitle className="text-lg">Parts & Materials</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {workOrder.inventoryItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium">
                        Total
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium">
                        ${workOrder.inventoryItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="interactions" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Work Order Interactions</h2>
            <Button onClick={() => setAddInteractionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Record Interaction
            </Button>
          </div>
          <InteractionsList 
            interactions={relatedInteractions} 
            title="Staff Interactions"
            showFilters={true}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete work order {workOrder.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Interaction Dialog */}
      {customer && (
        <AddInteractionDialog
          customer={customer}
          open={addInteractionOpen}
          onOpenChange={setAddInteractionOpen}
          onInteractionAdded={handleInteractionAdded}
          relatedWorkOrderId={workOrder.id}
        />
      )}
    </div>
  );
}
