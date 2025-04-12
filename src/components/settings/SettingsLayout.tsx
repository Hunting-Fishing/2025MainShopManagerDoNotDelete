
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

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { t } = useTranslation();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="grid min-w-max grid-cols-11 w-full">
          <TabsTrigger value="account">{t('settings.tabs.account')}</TabsTrigger>
          <TabsTrigger value="company">{t('settings.tabs.company')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="branding">{t('settings.tabs.branding')}</TabsTrigger>
          <TabsTrigger value="loyalty">{t('settings.tabs.loyalty')}</TabsTrigger>
          <TabsTrigger value="inventory">{t('settings.tabs.inventory')}</TabsTrigger>
          <TabsTrigger value="team">{t('settings.tabs.team')}</TabsTrigger>
          <TabsTrigger value="email">{t('settings.tabs.email')}</TabsTrigger>
          <TabsTrigger value="export">{t('settings.tabs.export')}</TabsTrigger>
          <TabsTrigger value="language">{t('settings.tabs.language')}</TabsTrigger>
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
