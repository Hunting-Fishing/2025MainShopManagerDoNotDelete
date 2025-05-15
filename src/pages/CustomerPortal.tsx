
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerAppointmentBooking } from "@/components/customer-portal/CustomerAppointmentBooking";
import { CustomerWorkOrders } from "@/components/customer-portal/CustomerWorkOrders";
import { CustomerVehicles } from "@/components/customer-portal/CustomerVehicles";
import { CustomerProfileInfo } from "@/components/customer-portal/CustomerProfileInfo";
import { CustomerPortalHeader } from "@/components/customer-portal/CustomerPortalHeader";
import { Helmet } from "react-helmet-async";
import { useAuthUser } from "@/hooks/useAuthUser";
import { CustomerLoginRequired } from "@/components/customer-portal/CustomerLoginRequired";
import { supabase } from "@/lib/supabase";

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          setIsLoading(false);
          return;
        }
        
        setUserId(data.session?.user?.id || null);
        
        // If we have a user, fetch their customer data
        if (data.session?.user?.id) {
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("auth_user_id", data.session.user.id)
            .single();
            
          if (customerError) {
            console.error("Error fetching customer data:", customerError);
          } else {
            setCustomerData(customerData);
          }
        }
      } catch (err) {
        console.error("Unexpected error checking auth:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthStatus();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUserId(session?.user?.id || null);
        
        // If we have a user, fetch their customer data
        if (session?.user?.id) {
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single();
            
          if (customerError) {
            console.error("Error fetching customer data:", customerError);
          } else {
            setCustomerData(customerData);
          }
        } else {
          setCustomerData(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userId) {
    return <CustomerLoginRequired />;
  }

  const customerName = customerData ? 
    `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : 
    'Customer';

  return (
    <>
      <Helmet>
        <title>Customer Portal | Easy Shop Manager</title>
      </Helmet>

      <div className="space-y-6" id="portal-content">
        <CustomerPortalHeader customerName={customerName} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Customer Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
                <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
                <TabsTrigger value="profile">My Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="appointments" id="portal-appointments">
                <CustomerAppointmentBooking />
              </TabsContent>
              <TabsContent value="work-orders" id="portal-work-orders">
                <CustomerWorkOrders customerId={customerData?.id} />
              </TabsContent>
              <TabsContent value="vehicles" id="portal-vehicles">
                <CustomerVehicles customerId={customerData?.id} />
              </TabsContent>
              <TabsContent value="profile" id="portal-profile">
                <CustomerProfileInfo customer={customerData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
