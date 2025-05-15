
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerAppointmentBooking } from "@/components/customer-portal/CustomerAppointmentBooking";
import { CustomerWorkOrders } from "@/components/customer-portal/CustomerWorkOrders";
import { CustomerVehicles } from "@/components/customer-portal/CustomerVehicles";
import { CustomerProfileInfo } from "@/components/customer-portal/CustomerProfileInfo";
import { Helmet } from "react-helmet-async";
import { useAuthUser } from "@/hooks/useAuthUser";
import { CustomerLoginRequired } from "@/components/customer-portal/CustomerLoginRequired";

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState("appointments");
  const { userId, isLoading } = useAuthUser();

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

  return (
    <>
      <Helmet>
        <title>Customer Portal | Easy Shop Manager</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customer Portal</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Welcome to your customer portal</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
                <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
                <TabsTrigger value="profile">My Profile</TabsTrigger>
              </TabsList>
              <TabsContent value="appointments">
                <CustomerAppointmentBooking />
              </TabsContent>
              <TabsContent value="work-orders">
                <CustomerWorkOrders />
              </TabsContent>
              <TabsContent value="vehicles">
                <CustomerVehicles />
              </TabsContent>
              <TabsContent value="profile">
                <CustomerProfileInfo />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
