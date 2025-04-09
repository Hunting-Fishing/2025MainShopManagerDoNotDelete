
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "./AccountTab";
import { CompanyTab } from "./CompanyTab";
import { SecurityTab } from "./SecurityTab";
import { NotificationsTab } from "./NotificationsTab";
import { BrandingTab } from "./BrandingTab";
import { DataExportTab } from "./DataExportTab";
import { LanguageTab } from "./LanguageTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { InventorySettingsTab } from "./InventorySettingsTab";
import { useTranslation } from 'react-i18next';

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { t } = useTranslation();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-9 w-full">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="language">Language</TabsTrigger>
      </TabsList>
      <div className="mt-6">
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="company">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="branding">
          <BrandingTab />
        </TabsContent>
        <TabsContent value="loyalty">
          <LoyaltyTab />
        </TabsContent>
        <TabsContent value="inventory">
          <InventorySettingsTab />
        </TabsContent>
        <TabsContent value="export">
          <DataExportTab />
        </TabsContent>
        <TabsContent value="language">
          <LanguageTab />
        </TabsContent>
      </div>
    </Tabs>
  );
};
