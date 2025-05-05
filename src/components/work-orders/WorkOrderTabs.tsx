
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface WorkOrderTabsProps {}

export const WorkOrderTabs: React.FC<WorkOrderTabsProps> = () => {
  return (
    <Tabs defaultValue="parts">
      <TabsList className="mb-4">
        <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="parts">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Inventory items feature will be implemented soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Time tracking feature will be implemented soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="documents">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Document management feature will be implemented soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="communications">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Communications feature will be implemented soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
