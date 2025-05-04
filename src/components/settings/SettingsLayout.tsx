import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { 
  User, Building, Shield, Bell, Palette, 
  Database, Globe2, Gift, Package, Users, Mail,
  Brush, MailPlus, ShieldCheck
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useShopId } from "@/hooks/useShopId";

import { AccountTab } from "./AccountTab";
import { CompanyTab } from "./CompanyTab";
import { SecurityTab } from "./SecurityTab";
import { NotificationsTab } from "./NotificationsTab";
import { BrandingTab } from "./BrandingTab";
import { AppearanceTab } from "./AppearanceTab";
import { EmailSettingsTab } from "./EmailSettingsTab";
import { SecurityAdvancedTab } from "./SecurityAdvancedTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { InventorySettingsTab } from "./InventorySettingsTab";
import { TeamHistoryTab } from "./TeamHistoryTab";
import { EmailSchedulingTab } from "./EmailSchedulingTab";
import { DataExportTab } from "./DataExportTab";
import { LanguageTab } from "./LanguageTab";

interface SettingsLayoutProps {
  defaultTab?: string;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ defaultTab }) => {
  // Get active tab from URL parameter, defaultTab prop, or localStorage, or default to "account"
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get("tab");
    
    // Then check prop
    if (tabFromUrl) return tabFromUrl;
    if (defaultTab) return defaultTab;
    
    // Finally check localStorage
    const savedTab = localStorage.getItem("settingsActiveTab");
    return savedTab || "account";
  });
  
  const { t } = useTranslation();
  const { shopId } = useShopId();

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("settingsActiveTab", activeTab);
    console.log("Saved settings tab:", activeTab);
  }, [activeTab]);

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
    <ResponsiveContainer maxWidth="2xl" className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 overflow-x-auto">
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

        <div className="mt-4">
          <TabsContent value="account" className="mt-0">
            <AccountTab />
          </TabsContent>
          <TabsContent value="company" className="mt-0">
            <CompanyTab />
          </TabsContent>
          <TabsContent value="security" className="mt-0">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="security-advanced" className="mt-0">
            <SecurityAdvancedTab shopId={shopId || undefined} />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="branding" className="mt-0">
            <BrandingTab />
          </TabsContent>
          <TabsContent value="appearance" className="mt-0">
            <AppearanceTab shopId={shopId || undefined} />
          </TabsContent>
          <TabsContent value="email" className="mt-0">
            <EmailSettingsTab shopId={shopId || undefined} />
          </TabsContent>
          <TabsContent value="integrations" className="mt-0">
            <IntegrationsTab shopId={shopId || undefined} />
          </TabsContent>
          <TabsContent value="loyalty" className="mt-0">
            <LoyaltyTab />
          </TabsContent>
          <TabsContent value="inventory" className="mt-0">
            <InventorySettingsTab />
          </TabsContent>
          <TabsContent value="team" className="mt-0">
            <TeamHistoryTab />
          </TabsContent>
          <TabsContent value="email-scheduling" className="mt-0">
            <EmailSchedulingTab />
          </TabsContent>
          <TabsContent value="export" className="mt-0">
            <DataExportTab />
          </TabsContent>
          <TabsContent value="language" className="mt-0">
            <LanguageTab />
          </TabsContent>
        </div>
      </Tabs>
    </ResponsiveContainer>
  );
};
