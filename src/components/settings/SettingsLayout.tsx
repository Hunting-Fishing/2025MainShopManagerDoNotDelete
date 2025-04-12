
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
import { AppearanceTab } from "./AppearanceTab";
import { EmailSettingsTab } from "./EmailSettingsTab";
import { IntegrationsTab } from "./IntegrationsTab";
import { SecurityAdvancedTab } from "./SecurityAdvancedTab";
import { useTranslation } from 'react-i18next';
import { useShopId } from "@/hooks/useShopId";
import { 
  User, Building, Shield, Bell, Palette, 
  Database, Globe2, Gift, Package, Users, Mail,
  Brush, MailPlus, Link, ShieldCheck
} from "lucide-react";

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { t } = useTranslation();
  const { shopId } = useShopId();

  // Define tabs with proper fallback values for translations
  const tabs = [
    { id: "account", label: t('settings.tabs.account', 'Account'), icon: User },
    { id: "company", label: t('settings.tabs.company', 'Company'), icon: Building },
    { id: "security", label: t('settings.tabs.security', 'Security'), icon: Shield },
    { id: "security-advanced", label: t('settings.tabs.security_advanced', 'Advanced Security'), icon: ShieldCheck },
    { id: "notifications", label: t('settings.tabs.notifications', 'Notifications'), icon: Bell },
    { id: "branding", label: t('settings.tabs.branding', 'Branding'), icon: Palette },
    { id: "appearance", label: t('settings.tabs.appearance', 'Appearance'), icon: Brush },
    { id: "email", label: t('settings.tabs.email', 'Email Settings'), icon: MailPlus },
    { id: "integrations", label: t('settings.tabs.integrations', 'Integrations'), icon: Link },
    { id: "loyalty", label: t('settings.tabs.loyalty', 'Loyalty'), icon: Gift },
    { id: "inventory", label: t('settings.tabs.inventory', 'Inventory'), icon: Package },
    { id: "team", label: t('settings.tabs.team', 'Team History'), icon: Users },
    { id: "email-scheduling", label: t('settings.tabs.email_scheduling', 'Email Scheduling'), icon: Mail },
    { id: "export", label: t('settings.tabs.export', 'Data Export'), icon: Database },
    { id: "language", label: t('settings.tabs.language', 'Language'), icon: Globe2 },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
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
        <TabsContent value="security-advanced">
          <SecurityAdvancedTab shopId={shopId || undefined} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="branding">
          <BrandingTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab shopId={shopId || undefined} />
        </TabsContent>
        <TabsContent value="email">
          <EmailSettingsTab shopId={shopId || undefined} />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab shopId={shopId || undefined} />
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
        <TabsContent value="email-scheduling">
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
