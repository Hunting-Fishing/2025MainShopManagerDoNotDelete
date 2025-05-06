
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryTableColumnsManager } from "./inventory/InventoryTableColumnsManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const InventorySettingsTab = () => {
  return (
    <Tabs defaultValue="columns" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="columns">Table Columns</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
      </TabsList>
      
      <TabsContent value="columns" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Table Columns</CardTitle>
            <CardDescription>
              Configure which columns appear in your inventory table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Changes made here will immediately affect the column visibility in your inventory table.
                Your settings are saved automatically when you click "Save Settings".
              </AlertDescription>
            </Alert>
            <InventoryTableColumnsManager />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="categories" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Categories Management</CardTitle>
            <CardDescription>
              Manage your inventory categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Categories Manager will go here */}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="suppliers" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Suppliers Management</CardTitle>
            <CardDescription>
              Manage your inventory suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Suppliers Manager will go here */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
