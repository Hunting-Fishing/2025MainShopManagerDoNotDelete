
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/customer";
import { SmsLogsTable } from "@/components/sms/SmsLogsTable";
import { SmsTemplatesList } from "@/components/sms/SmsTemplatesList";

interface CustomerAnalyticsSectionProps {
  customer: Customer;
}

export const CustomerAnalyticsSection: React.FC<CustomerAnalyticsSectionProps> = ({ 
  customer 
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sms" className="w-full">
        <TabsList>
          <TabsTrigger value="sms">SMS Communications</TabsTrigger>
          <TabsTrigger value="templates">SMS Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="sms">
          <SmsLogsTable customerId={customer.id} limit={20} />
        </TabsContent>
        <TabsContent value="templates">
          <SmsTemplatesList />
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Customer analytics feature coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
