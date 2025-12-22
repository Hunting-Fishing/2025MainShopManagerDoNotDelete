
import React from "react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { InventoryFieldManager } from "@/components/inventory/manager/InventoryFieldManager";
import { InventorySettingsPanel } from "@/components/inventory/InventorySettingsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryViewProvider } from "@/contexts/InventoryViewContext";

export default function InventoryManager() {
  return (
    <SettingsPageLayout
      title="Inventory Manager"
      description="Configure inventory fields and system preferences"
    >
      <InventoryViewProvider>
        <Tabs defaultValue="fields" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          <TabsContent value="fields">
            <InventoryFieldManager />
          </TabsContent>
          <TabsContent value="preferences">
            <InventorySettingsPanel />
          </TabsContent>
        </Tabs>
      </InventoryViewProvider>
    </SettingsPageLayout>
  );
}
