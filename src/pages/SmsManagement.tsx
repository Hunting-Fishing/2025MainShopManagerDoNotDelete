
import React, { useState } from "react";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { SmsTemplatesList } from "@/components/sms/SmsTemplatesList";
import { SmsLogsTable } from "@/components/sms/SmsLogsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SmsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SMS Management</h1>
        <p className="text-muted-foreground">
          Manage SMS templates and view SMS logs
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Message Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <SmsTemplatesList />
        </TabsContent>
        <TabsContent value="logs">
          <SmsLogsTable limit={50} />
        </TabsContent>
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>SMS Statistics</CardTitle>
              <CardDescription>
                View metrics about your SMS usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                SMS statistics feature coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
