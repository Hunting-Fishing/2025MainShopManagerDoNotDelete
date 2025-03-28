import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { CalendarIcon, Save, X, Package, Plus } from "lucide-react";

import { WorkOrder } from "@/data/workOrdersData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateWorkOrder } from "@/utils/workOrderUtils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface WorkOrderEditFormProps {
  workOrder: WorkOrder;
}

// Mock data for inventory items (should match the type we defined)
const inventoryItems = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    supplier: "TechSupplies Inc.",
    quantity: 45,
    unitPrice: 24.99,
    status: "In Stock",
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    supplier: "PlumbPro Distributors",
    quantity: 120,
    unitPrice: 18.75,
    status: "In Stock",
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    supplier: "ElectroSupply Co.",
    quantity: 35,
    unitPrice: 42.50,
    status: "In Stock",
  },
  {
    id: "INV-1004",
    name: "Door Lock Set - Commercial Grade",
    sku: "DL-CG-100",
    category: "Security",
    supplier: "SecureTech Systems",
    quantity: 12,
    unitPrice: 89.99,
    status: "Low Stock",
  },
];

// Inventory item schema (updated to match our type definition)
const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number()
});

// Form schema validation (updated to use the proper types)
const formSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"], {
    required_error: "Please select a status.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority.",
  }),
  technician: z.string().min(1, {
    message: "Please select a technician.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  notes: z.string().optional(),
  inventoryItems: z.array(inventoryItemSchema).optional(),
});

// Mock data for technicians
const technicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
  "Unassigned",
];

export default function WorkOrderEditForm({ workOrder }: WorkOrderEditFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);

  // Parse the date strings into Date objects
  const dueDateAsDate = parse(workOrder.dueDate, "yyyy-MM-dd", new Date());

  // Initialize the form with existing work order data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: workOrder.customer,
      description: workOrder.description,
      status: workOrder.status,
      priority: workOrder.priority,
      technician: workOrder.technician,
      location: workOrder.location,
      dueDate: dueDateAsDate,
      notes: workOrder.notes || "",
      inventoryItems: workOrder.inventoryItems || [],
    },
  });

  // Get current inventory items
  const selectedItems = form.watch("inventoryItems") || [];

  // Handle adding inventory item
  const handleAddItem = (item: typeof inventoryItems[0]) => {
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Check if item already exists
    const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      form.setValue("inventoryItems", updatedItems);
    } else {
      // Add new item with required properties to satisfy WorkOrderInventoryItem type
      const newItem: WorkOrderInventoryItem = {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: 1,
        unitPrice: item.unitPrice
      };
      
      form.setValue("inventoryItems", [...currentItems, newItem]);
    }
    
    setShowInventoryDialog(false);
  };

  // Handle removing inventory item
  const handleRemoveItem = (id: string) => {
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", currentItems.filter(item => item.id !== id));
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    const currentItems = form.getValues("inventoryItems") || [];
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    
    form.setValue("inventoryItems", updatedItems);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Format the date back to YYYY-MM-DD string format
      const formattedDueDate = format(values.dueDate, "yyyy-MM-dd");
      
      // Create the updated work order object
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        customer: values.customer,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician: values.technician,
        location: values.location,
        dueDate: formattedDueDate,
        notes: values.notes,
        inventoryItems: values.inventoryItems || [],
      };
      
      // Update the work order
      await updateWorkOrder(updatedWorkOrder);
      
      // Show success message
      toast({
        title: "Work Order Updated",
        description: `Work order ${workOrder.id} has been updated successfully.`,
      });
      
      // Navigate back to the details view
      navigate(`/work-orders/${workOrder.id}`);
    } catch (error) {
      console.error("Error updating work order:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to update work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Work Order: {workOrder.id}</h1>
          <p className="text-muted-foreground">Make changes to the work order details below</p>
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(`/work-orders/${workOrder.id}`)}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Work Order Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Field */}
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Field */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the work" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Field */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority Field */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Technician Field */}
                <FormField
                  control={form.control}
                  name="technician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Technician</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech} value={tech}>
                              {tech}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date Field */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes Field */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional details or instructions"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Inventory Items Field */}
                <FormField
                  name="inventoryItems"
                  render={() => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Parts & Materials</FormLabel>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Add parts and materials from inventory that will be used for this work order
                          </div>
                          
                          <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                Add Inventory Item
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Select Inventory Item</DialogTitle>
                                <DialogDescription>
                                  Choose items from inventory to add to the work order.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="max-h-[400px] overflow-y-auto mt-4">
                                <div className="space-y-3">
                                  {inventoryItems.map((item) => (
                                    <div 
                                      key={item.id} 
                                      className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                                      onClick={() => handleAddItem(item)}
                                    >
                                      <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-slate-500">
                                          {item.sku} - ${item.unitPrice.toFixed(2)} - {item.status}
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="sm">
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {selectedItems.length > 0 ? (
                          <div className="border rounded-md">
                            <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {selectedItems.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{item.sku}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <div className="flex items-center justify-center">
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          className="h-7 w-7"
                                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                        >
                                          -
                                        </Button>
                                        <Input 
                                          type="number" 
                                          value={item.quantity}
                                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                          className="h-7 w-16 mx-1 text-center"
                                          min={1}
                                        />
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          className="h-7 w-7"
                                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-right">
                                      ${(item.quantity * item.unitPrice).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-red-500"
                                        onClick={() => handleRemoveItem(item.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 border border-dashed rounded-md text-center text-slate-500">
                            No inventory items added yet. Use the button above to add items from inventory.
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-esm-blue-600 hover:bg-esm-blue-700 flex gap-2 items-center"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
