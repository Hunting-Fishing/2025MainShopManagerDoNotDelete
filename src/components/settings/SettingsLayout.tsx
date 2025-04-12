
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
import { TeamHistoryTab } from "./TeamHistoryTab";
import { EmailSchedulingTab } from "./EmailSchedulingTab";
import { useTranslation } from 'react-i18next';
import { 
  User, Building, Shield, Bell, Palette, 
  Database, Globe2, Gift, Package, Users, Mail 
} from "lucide-react";

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { t } = useTranslation();

  const tabs = [
    { id: "account", label: t('settings.tabs.account'), icon: User },
    { id: "company", label: t('settings.tabs.company'), icon: Building },
    { id: "security", label: t('settings.tabs.security'), icon: Shield },
    { id: "notifications", label: t('settings.tabs.notifications'), icon: Bell },
    { id: "branding", label: t('settings.tabs.branding'), icon: Palette },
    { id: "loyalty", label: t('settings.tabs.loyalty'), icon: Gift },
    { id: "inventory", label: t('settings.tabs.inventory'), icon: Package },
    { id: "team", label: t('settings.tabs.team'), icon: Users },
    { id: "email", label: t('settings.tabs.email'), icon: Mail },
    { id: "export", label: t('settings.tabs.export'), icon: Database },
    { id: "language", label: t('settings.tabs.language'), icon: Globe2 },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="mb-6 overflow-x-auto pb-2">
        <TabsList className="inline-flex h-10 items-center justify-start space-x-1 rounded-md p-1 bg-muted/20">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
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
        <TabsContent value="team">
          <TeamHistoryTab />
        </TabsContent>
        <TabsContent value="email">
          <EmailSchedulingTab />
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
