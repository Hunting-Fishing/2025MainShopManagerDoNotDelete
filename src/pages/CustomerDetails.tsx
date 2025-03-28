
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { findCustomerById } from "@/data/customersData";
import { Customer } from "@/types/customer";
import { workOrders } from "@/data/workOrdersData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceHistoryTable } from "@/components/service-history/ServiceHistoryTable";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  FileText,
  Edit,
  ClipboardList
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustomerData = () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/customers");
          return;
        }

        const foundCustomer = findCustomerById(id);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          
          // Filter work orders for this customer
          const filteredOrders = workOrders.filter(
            (order) => order.customer.toLowerCase() === foundCustomer.name.toLowerCase()
          );
          
          setCustomerWorkOrders(filteredOrders);
        } else {
          toast({
            title: "Customer not found",
            description: "The requested customer could not be found.",
            variant: "destructive",
          });
          navigate("/customers");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast({
          title: "Error",
          description: "Failed to load customer details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <Badge 
                variant={customer.status === 'active' ? 'default' : 'secondary'}
              >
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {customer.company && (
              <p className="text-muted-foreground">{customer.company}</p>
            )}
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline"
              asChild
            >
              <Link to={`/work-orders/new?customer=${encodeURIComponent(customer.name)}`}>
                <ClipboardList className="mr-2 h-4 w-4" /> New Work Order
              </Link>
            </Button>
            <Button 
              variant="outline"
              asChild
            >
              <Link to={`/customers/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Customer
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-sm">{customer.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone</p>
                  <p className="text-sm">{customer.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Address</p>
                  <p className="text-sm">{customer.address}</p>
                </div>
              </div>
              
              {customer.company && (
                <div className="flex items-start">
                  <Building2 className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Company</p>
                    <p className="text-sm">{customer.company}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Customer Since</p>
                  <p className="text-sm">{new Date(customer.dateAdded).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Customer Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">Total Work Orders</p>
                <p className="text-2xl font-bold">{customerWorkOrders.length}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">Last Service</p>
                <p className="text-2xl font-bold">
                  {customer.lastServiceDate 
                    ? new Date(customer.lastServiceDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-500">Active Work Orders</p>
                <p className="text-2xl font-bold">
                  {customerWorkOrders.filter(order => 
                    order.status === 'pending' || order.status === 'in-progress'
                  ).length}
                </p>
              </div>
            </div>
            
            {customer.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-500">Recent Service History</h3>
                <Button 
                  variant="link" 
                  size="sm" 
                  asChild
                  className="h-auto p-0"
                >
                  <Link to={`/customer-service-history/${encodeURIComponent(customer.name)}`}>
                    <FileText className="h-4 w-4 mr-1" /> View Full History
                  </Link>
                </Button>
              </div>
              
              <ServiceHistoryTable 
                workOrders={customerWorkOrders.slice(0, 5)} 
                showEquipment={true}
              />
              
              {customerWorkOrders.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  No service history found for this customer.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
