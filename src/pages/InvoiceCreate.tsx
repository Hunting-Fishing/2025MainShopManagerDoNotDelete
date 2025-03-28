
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Check, Package, Users, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Mock data for work orders (in a real app would be fetched from API)
const workOrders = [
  {
    id: "WO-2023-0012",
    customer: "Acme Corporation",
    description: "HVAC System Repair",
    status: "in-progress",
    date: "2023-08-15",
    dueDate: "2023-08-20",
    priority: "high",
    technician: "Michael Brown",
    location: "123 Business Park, Suite 400",
  },
  {
    id: "WO-2023-0011",
    customer: "Johnson Residence",
    description: "Electrical Panel Upgrade",
    status: "pending",
    date: "2023-08-14",
    dueDate: "2023-08-22",
    priority: "medium",
    technician: "Unassigned",
    location: "456 Maple Street",
  },
  // more work orders...
];

// Mock data for inventory items (in a real app would be fetched from API)
const inventoryItems = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    price: 24.99,
    description: "High-efficiency particulate air filter",
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    price: 18.75,
    description: "Standard copper pipe for plumbing installations",
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    price: 42.50,
    description: "30 Amp circuit breaker for electrical panels",
  },
  // more inventory items...
];

// Mock data for staff members (in a real app would be fetched from API)
const staffMembers = [
  { id: 1, name: "Michael Brown", role: "Technician" },
  { id: 2, name: "Sarah Johnson", role: "Technician" },
  { id: 3, name: "David Lee", role: "Technician" },
  { id: 4, name: "Emily Chen", role: "Technician" },
  { id: 5, name: "James Wilson", role: "Office Manager" },
];

export default function InvoiceCreate() {
  const { workOrderId } = useParams<{ workOrderId?: string }>();
  const navigate = useNavigate();
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  
  // Form state
  const [invoice, setInvoice] = useState({
    id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    customer: "",
    customerAddress: "",
    customerEmail: "",
    description: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    workOrderId: workOrderId || "",
    createdBy: "",
    assignedStaff: [] as string[],
    items: [] as {
      id: string;
      name: string;
      description: string;
      quantity: number;
      price: number;
      total: number;
    }[],
  });

  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax rate - this could be configurable
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Load work order data if workOrderId is provided
  useEffect(() => {
    if (workOrderId) {
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (workOrder) {
        setInvoice(prev => ({
          ...prev,
          workOrderId: workOrder.id,
          customer: workOrder.customer,
          description: workOrder.description,
          assignedStaff: [workOrder.technician].filter(t => t !== "Unassigned")
        }));
      }
    }
  }, [workOrderId]);

  // Handle selecting a work order
  const handleSelectWorkOrder = (workOrder: typeof workOrders[0]) => {
    setInvoice(prev => ({
      ...prev,
      workOrderId: workOrder.id,
      customer: workOrder.customer,
      description: workOrder.description,
      assignedStaff: [workOrder.technician].filter(t => t !== "Unassigned")
    }));
    setShowWorkOrderDialog(false);
  };

  // Handle adding an inventory item
  const handleAddInventoryItem = (item: typeof inventoryItems[0]) => {
    // Check if item already exists
    const existingItem = invoice.items.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if already exists
      setInvoice(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id 
            ? { 
                ...i, 
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * i.price
              } 
            : i
        )
      }));
    } else {
      // Add new item
      setInvoice(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            id: item.id,
            name: item.name,
            description: item.description || "",
            quantity: 1,
            price: item.price,
            total: item.price
          }
        ]
      }));
    }
    
    setShowInventoryDialog(false);
  };

  // Handle adding staff member
  const handleAddStaffMember = (staffMember: typeof staffMembers[0]) => {
    if (!invoice.assignedStaff.includes(staffMember.name)) {
      setInvoice(prev => ({
        ...prev,
        assignedStaff: [...prev.assignedStaff, staffMember.name]
      }));
    }
    setShowStaffDialog(false);
  };

  // Handle removing staff member
  const handleRemoveStaffMember = (name: string) => {
    setInvoice(prev => ({
      ...prev,
      assignedStaff: prev.assignedStaff.filter(staff => staff !== name)
    }));
  };

  // Handle removing an item
  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Handle updating item quantity
  const handleUpdateItemQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { ...item, quantity, total: quantity * item.price } 
          : item
      )
    }));
  };

  // Handle saving invoice
  const handleSaveInvoice = (status: string) => {
    // Update status and save
    const finalInvoice = {
      ...invoice,
      status,
      subtotal,
      tax,
      total
    };
    
    console.log("Saving invoice:", finalInvoice);
    
    // In a real app, this would be an API call
    // For now, just navigate back to invoices list
    navigate("/invoices");
  };

  // Handle adding labor item
  const handleAddLaborItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `labor-${Date.now()}`,
          name: "Service Labor",
          description: "Technician hours",
          quantity: 1,
          price: 100, // Default labor rate
          total: 100
        }
      ]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSaveInvoice("draft")}
          >
            Save as Draft
          </Button>
          <Button 
            variant="default" 
            className="bg-esm-blue-600 hover:bg-esm-blue-700"
            onClick={() => handleSaveInvoice("pending")}
          >
            Create Invoice
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Invoice Information</h2>
            
            {/* Basic details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="invoice-id">Invoice Number</Label>
                <Input 
                  id="invoice-id" 
                  value={invoice.id} 
                  onChange={(e) => setInvoice(prev => ({ ...prev, id: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={invoice.status}
                  onValueChange={(value) => setInvoice(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input 
                  id="issue-date" 
                  type="date" 
                  value={invoice.date}
                  onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input 
                  id="due-date" 
                  type="date" 
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Work Order Reference */}
            <div className="flex items-center justify-between mb-2">
              <Label>Work Order Reference</Label>
              <Dialog open={showWorkOrderDialog} onOpenChange={setShowWorkOrderDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    {invoice.workOrderId ? "Change" : "Link"} Work Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Select Work Order</DialogTitle>
                    <DialogDescription>
                      Choose a work order to link to this invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="space-y-4">
                      {workOrders.map((wo) => (
                        <div 
                          key={wo.id} 
                          className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleSelectWorkOrder(wo)}
                        >
                          <div>
                            <div className="font-medium">{wo.id} - {wo.customer}</div>
                            <div className="text-sm text-slate-500">{wo.description}</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {invoice.workOrderId ? (
              <div className="p-3 mb-6 rounded border border-slate-200 bg-slate-50">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{invoice.workOrderId}</div>
                    <div className="text-sm text-slate-500">{invoice.description}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setInvoice(prev => ({ ...prev, workOrderId: "" }))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 mb-6 rounded border border-dashed border-slate-300 text-center text-slate-500">
                No work order linked
              </div>
            )}
            
            {/* Customer details */}
            <h3 className="font-medium mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <Label htmlFor="customer">Customer Name</Label>
                <Input 
                  id="customer" 
                  value={invoice.customer}
                  onChange={(e) => setInvoice(prev => ({ ...prev, customer: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customer-address">Customer Address</Label>
                <Textarea 
                  id="customer-address" 
                  value={invoice.customerAddress}
                  onChange={(e) => setInvoice(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Enter customer address"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="customer-email">Customer Email</Label>
                <Input 
                  id="customer-email" 
                  type="email"
                  value={invoice.customerEmail}
                  onChange={(e) => setInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={invoice.description}
                onChange={(e) => setInvoice(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter invoice description"
                rows={2}
              />
            </div>
            
            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={invoice.notes}
                onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
          
          {/* Items */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Invoice Items</h2>
              <div className="flex gap-2">
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
                        Choose items from inventory to add to the invoice.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="space-y-4 mt-2">
                        {inventoryItems.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                            onClick={() => handleAddInventoryItem(item)}
                          >
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-slate-500">{item.sku} - ${item.price.toFixed(2)}</div>
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
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleAddLaborItem}
                >
                  <Plus className="h-4 w-4" />
                  Add Labor
                </Button>
              </div>
            </div>
            
            {/* Items list */}
            {invoice.items.length > 0 ? (
              <div className="mt-4 border rounded-md">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          <Input 
                            value={item.description} 
                            onChange={(e) => {
                              setInvoice(prev => ({
                                ...prev,
                                items: prev.items.map(i => 
                                  i.id === item.id ? { ...i, description: e.target.value } : i
                                )
                              }));
                            }}
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="h-7 w-16 mx-1 text-center"
                              min={1}
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end">
                            <span className="mr-1">$</span>
                            <Input 
                              type="number" 
                              value={item.price}
                              onChange={(e) => {
                                const price = parseFloat(e.target.value) || 0;
                                setInvoice(prev => ({
                                  ...prev,
                                  items: prev.items.map(i => 
                                    i.id === item.id ? { ...i, price, total: i.quantity * price } : i
                                  )
                                }));
                              }}
                              className="h-7 w-24 text-right"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          ${item.total.toFixed(2)}
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
                No items added yet. Use the buttons above to add items from inventory or add labor.
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Summary and Staff */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Invoice Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Staff Assignment */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Staff</h2>
              <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Select Staff Member</DialogTitle>
                    <DialogDescription>
                      Choose staff members involved in this invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="space-y-3 mt-2">
                      {staffMembers.map((staff) => (
                        <div 
                          key={staff.id} 
                          className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() => handleAddStaffMember(staff)}
                        >
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-slate-500">{staff.role}</div>
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
            
            {/* Creator */}
            <div className="mb-4">
              <Label htmlFor="creator">Created By</Label>
              <Select 
                value={invoice.createdBy}
                onValueChange={(value) => setInvoice(prev => ({ ...prev, createdBy: value }))}
              >
                <SelectTrigger id="creator">
                  <SelectValue placeholder="Select creator" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.name}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Assigned staff */}
            <Label className="mb-2 block">Assigned Staff</Label>
            {invoice.assignedStaff.length > 0 ? (
              <div className="space-y-2">
                {invoice.assignedStaff.map((name) => (
                  <div key={name} className="flex justify-between items-center p-2 rounded bg-slate-50">
                    <span>{name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveStaffMember(name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 border border-dashed rounded-md text-center text-slate-500">
                No staff members assigned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
