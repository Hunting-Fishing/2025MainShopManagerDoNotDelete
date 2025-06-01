
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, ClipboardList, MessageSquare, FileText, Plus } from "lucide-react";
import { Customer, getCustomerFullName } from "@/types/customer";
import { CreateWorkOrderFromCustomerDialog } from "@/components/work-orders/CreateWorkOrderFromCustomerDialog";

interface CustomerDetailsHeaderProps {
  customer: Customer;
  setAddInteractionOpen: (open: boolean) => void;
}

export function CustomerDetailsHeader({ 
  customer, 
  setAddInteractionOpen 
}: CustomerDetailsHeaderProps) {
  const navigate = useNavigate();
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const customerName = getCustomerFullName(customer);

  const handleCreateInvoice = () => {
    // Navigate to invoice creation with customer data pre-filled
    const params = new URLSearchParams({
      customerId: customer.id,
      customerName: customerName,
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
      customerAddress: customer.address || ''
    });
    
    navigate(`/invoices/new?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate("/customers")} 
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{customerName}</h1>
            <Badge variant="default">Active</Badge>
          </div>
          {customer.company && (
            <p className="text-muted-foreground">{customer.company}</p>
          )}
          {customer.email && (
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          )}
          {customer.phone && (
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setAddInteractionOpen(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> 
            Record Interaction
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowWorkOrderDialog(true)}
          >
            <ClipboardList className="mr-2 h-4 w-4" /> 
            New Work Order
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={handleCreateInvoice}
          >
            <FileText className="mr-2 h-4 w-4" /> 
            Create Invoice
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> 
              Edit Customer
            </Link>
          </Button>
        </div>
      </div>

      <CreateWorkOrderFromCustomerDialog
        customer={customer}
        open={showWorkOrderDialog}
        onOpenChange={setShowWorkOrderDialog}
      />
    </div>
  );
}
