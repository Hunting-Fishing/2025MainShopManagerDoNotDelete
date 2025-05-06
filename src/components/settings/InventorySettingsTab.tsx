
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryTableColumnsManager } from "./inventory/InventoryTableColumnsManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InventoryFieldManager } from "@/components/inventory/manager/InventoryFieldManager";

export const InventorySettingsTab = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "columns";

  const handleTabChange = (value: string) => {
    navigate(`/settings/inventory?tab=${value}`, { replace: true });
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="columns" className="px-4 py-2">Table Columns</TabsTrigger>
        <TabsTrigger value="fields" className="px-4 py-2">Required Fields</TabsTrigger>
        <TabsTrigger value="categories" className="px-4 py-2">Categories</TabsTrigger>
        <TabsTrigger value="suppliers" className="px-4 py-2">Suppliers</TabsTrigger>
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
      
      <TabsContent value="fields" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Required Inventory Fields</CardTitle>
            <CardDescription>
              Configure which fields are required when creating and editing inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Only fields that are visible in the inventory table can be configured here.
                To show more fields, first make them visible in the Table Columns tab.
                Be sure to click "Save Settings" to persist your changes.
              </AlertDescription>
            </Alert>
            <InventoryFieldManager />
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
