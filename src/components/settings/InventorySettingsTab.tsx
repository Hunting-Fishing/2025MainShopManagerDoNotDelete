
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryTableColumnsManager } from "./inventory/InventoryTableColumnsManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InventoryFieldManager } from "@/components/inventory/manager/InventoryFieldManager";
import { CategoriesManager } from "./inventory/CategoriesManager";
import { SuppliersManager } from "./inventory/SuppliersManager";

export const InventorySettingsTab = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "columns";

  const handleTabChange = (value: string) => {
    navigate(`/settings/inventory?tab=${value}`, { replace: true });
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="mb-4 flex flex-wrap gap-2">
        <TabsTrigger value="columns" className="px-4 py-2 rounded-full text-sm">Table Columns</TabsTrigger>
        <TabsTrigger value="fields" className="px-4 py-2 rounded-full text-sm">Required Fields</TabsTrigger>
        <TabsTrigger value="categories" className="px-4 py-2 rounded-full text-sm">Categories</TabsTrigger>
        <TabsTrigger value="suppliers" className="px-4 py-2 rounded-full text-sm">Suppliers</TabsTrigger>
      </TabsList>
      
      <TabsContent value="columns" className="space-y-4">
        <Card className="shadow-md border-gray-100">
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
        <Card className="shadow-md border-gray-100">
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
        <Card className="shadow-md border-gray-100">
          <CardHeader>
            <CardTitle>Categories Management</CardTitle>
            <CardDescription>
              Manage your inventory categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoriesManager />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="suppliers" className="space-y-4">
        <Card className="shadow-md border-gray-100">
          <CardHeader>
            <CardTitle>Suppliers Management</CardTitle>
            <CardDescription>
              Manage your inventory suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuppliersManager />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
