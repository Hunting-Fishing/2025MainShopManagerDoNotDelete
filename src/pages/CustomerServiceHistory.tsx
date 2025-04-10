
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchWorkOrders, WorkOrder } from "@/data/workOrdersData";
import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceHistoryTable } from "@/components/service-history/ServiceHistoryTable";
import { toast } from "@/hooks/use-toast";
import { SendSmsButton } from "@/components/calls/SendSmsButton";
import { VoiceCallButton } from "@/components/calls/VoiceCallButton";
import { CallHistory } from "@/components/calls/CallHistory";

export default function CustomerServiceHistory() {
  const { customer } = useParams<{ customer: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    const fetchCustomerWorkOrders = async () => {
      setLoading(true);
      try {
        if (!customer) {
          navigate("/customers");
          return;
        }

        // Fetch work orders
        const allWorkOrders = await fetchWorkOrders();
        
        // Filter work orders for this customer
        const filteredOrders = allWorkOrders.filter(
          (order) => order.customer.toLowerCase() === customer.toLowerCase()
        );
        
        if (filteredOrders.length === 0) {
          toast({
            title: "No service history",
            description: "No service history found for this customer.",
          });
        }
        
        setCustomerWorkOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching customer service history:", error);
        toast({
          title: "Error",
          description: "Failed to load service history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerWorkOrders();
  }, [customer, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading service history...</div>
      </div>
    );
  }

  // Use the first work order to get the customer name (if available)
  const customerName = customerWorkOrders.length > 0 
    ? customerWorkOrders[0].customer 
    : customer;

  // This would come from customer data in a real app
  const phoneNumber = "";
  const customerId = "";

  return (
    <div className="space-y-6">
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Service History</h1>
            <p className="text-muted-foreground">
              Service history for {customerName}
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <SendSmsButton 
              phoneNumber={phoneNumber} 
              message={`Hello ${customerName}, regarding your service history`} 
              customerId={customerId}
              variant="outline"
              size="sm"
            />
            <VoiceCallButton
              phoneNumber={phoneNumber}
              callType="service_update" 
              customerId={customerId}
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-slate-500" />
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="font-medium">{customerName}</h3>
              {/* In a real app, you would display more customer information here */}
              <p className="text-sm text-slate-500 mt-1">
                Total Service Records: {customerWorkOrders.length}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/customers/${customer}`}>View Customer Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Service History</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ServiceHistoryTable workOrders={customerWorkOrders} showEquipment={true} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Communication History</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <CallHistory customerId={customerId || ""} />
        </CardContent>
      </Card>
    </div>
  );
}
