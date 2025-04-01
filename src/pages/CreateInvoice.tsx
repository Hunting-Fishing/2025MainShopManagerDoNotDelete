
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Receipt, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { workOrders } from '@/data/workOrdersData';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<InvoiceItem>({
    id: uuidv4(),
    name: "",
    description: "",
    quantity: 1,
    price: 0,
    total: 0
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const dueDate = format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd');

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08; // Assuming 8% tax rate
  };

  const calculateTotal = (subtotal: number, tax: number) => {
    return subtotal + tax;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);

  const handleAddItem = () => {
    // Validate item
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) {
      toast({
        title: "Invalid Item",
        description: "Please provide a name, valid quantity, and price",
        variant: "destructive",
      });
      return;
    }

    const itemWithTotal = {
      ...newItem,
      total: newItem.quantity * newItem.price
    };

    setItems([...items, itemWithTotal]);
    setNewItem({
      id: uuidv4(),
      name: "",
      description: "",
      quantity: 1,
      price: 0,
      total: 0
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleWorkOrderSelect = (workOrderId: string) => {
    setSelectedWorkOrder(workOrderId);
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    
    if (workOrder && workOrder.inventoryItems) {
      // Convert work order inventory items to invoice items
      const woItems = workOrder.inventoryItems.map(item => ({
        id: uuidv4(),
        name: item.name,
        description: item.sku || "", // Use SKU as description since there's no description property
        quantity: item.quantity,
        price: item.unitPrice, // Use unitPrice instead of price
        total: item.quantity * item.unitPrice // Use unitPrice here too
      }));
      
      setItems(woItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Collect form data
      const form = e.target as HTMLFormElement;
      const invoiceData = {
        workOrderId: selectedWorkOrder,
        customer: form.customer.value,
        customerEmail: form.customerEmail.value,
        customerAddress: form.customerAddress.value,
        date: form.invoiceDate.value,
        dueDate: form.dueDate.value,
        notes: form.notes.value,
        items,
        subtotal,
        tax,
        total
      };
      
      console.log("Invoice data:", invoiceData);
      // In a real app, you would save this to your database
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      
      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Receipt className="h-5 w-5 mr-2" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workOrder">Work Order (Optional)</Label>
                    <Select 
                      onValueChange={handleWorkOrderSelect} 
                      value={selectedWorkOrder}
                    >
                      <SelectTrigger id="workOrder">
                        <SelectValue placeholder="Select a work order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {workOrders.map((workOrder) => (
                          <SelectItem key={workOrder.id} value={workOrder.id}>
                            {workOrder.id} - {workOrder.customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Customer Name*</Label>
                    <Input id="customer" name="customer" placeholder="Customer name" required />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input id="customerEmail" name="customerEmail" type="email" placeholder="Customer email" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerAddress">Customer Address</Label>
                  <Textarea id="customerAddress" name="customerAddress" placeholder="Customer address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date*</Label>
                    <Input id="invoiceDate" name="invoiceDate" type="date" defaultValue={today} required />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date*</Label>
                    <Input id="dueDate" name="dueDate" type="date" defaultValue={dueDate} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Items */}
                {items.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Item</th>
                          <th className="px-4 py-2 text-right">Qty</th>
                          <th className="px-4 py-2 text-right">Price</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          <th className="px-4 py-2 text-center w-10">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                            <td className="px-4 py-2 text-center">
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-md p-6 text-center">
                    <p className="text-muted-foreground">No items added yet. Add an item below.</p>
                  </div>
                )}

                {/* Add New Item */}
                <div className="border rounded-md p-4 space-y-4">
                  <h4 className="font-medium">Add New Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName">Item Name</Label>
                      <Input 
                        id="itemName" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        placeholder="Item name" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemDescription">Description</Label>
                      <Input 
                        id="itemDescription" 
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Item description" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="itemQuantity">Quantity</Label>
                      <Input 
                        id="itemQuantity" 
                        type="number" 
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          quantity: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemPrice">Price ($)</Label>
                      <Input 
                        id="itemPrice" 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          price: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button 
                        type="button"
                        className="w-full"
                        onClick={handleAddItem}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  id="notes" 
                  name="notes"
                  placeholder="Enter any additional notes or payment terms" 
                  className="min-h-[100px]" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Tax (8%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-t-border">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </ResponsiveContainer>
  );
}
