import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, ClipboardList, MessageSquare, AlertTriangle } from "lucide-react";
import { Customer, getCustomerFullName } from "@/types/customer";
import { Alert } from "@/components/ui/alert";

interface CustomerHeaderProps {
  customer: Customer & { name?: string, status?: string };
  setAddInteractionOpen: (open: boolean) => void;
}

export const CustomerDetailsHeader: React.FC<CustomerHeaderProps> = ({ 
  customer, 
  setAddInteractionOpen 
}) => {
  const navigate = useNavigate();
  
  if (!customer || !customer.id) {
    return (
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/customers")} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
        
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Invalid customer data</span>
        </Alert>
      </div>
    );
  }
  
  const customerName = customer.name || getCustomerFullName(customer);
  const customerStatus = customer.status || 'active';

  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate("/customers")} 
        className="mb-4 text-esm-blue-600 hover:text-esm-blue-700 hover:bg-esm-blue-50"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{customerName}</h1>
            <Badge 
              variant={customerStatus === 'active' ? 'default' : 'secondary'}
              className={customerStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
            >
              {customerStatus === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {customer.company && (
            <p className="text-muted-foreground">{customer.company}</p>
          )}
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline"
            onClick={() => setAddInteractionOpen(true)}
            className="border-esm-blue-200 hover:bg-esm-blue-50"
          >
            <MessageSquare className="mr-2 h-4 w-4 text-esm-blue-500" /> Record Interaction
          </Button>
          <Button 
            variant="outline"
            asChild
            className="border-esm-blue-200 hover:bg-esm-blue-50"
          >
            <Link to={`/work-orders/new?customerId=${customer.id}&customerName=${encodeURIComponent(customerName)}`}>
              <ClipboardList className="mr-2 h-4 w-4 text-esm-blue-500" /> New Work Order
            </Link>
          </Button>
          <Button 
            variant="outline"
            asChild
            className="border-esm-blue-200 hover:bg-esm-blue-50"
          >
            <Link to={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4 text-esm-blue-500" /> Edit Customer
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
