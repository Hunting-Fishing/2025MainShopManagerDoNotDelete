
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyTab } from './CompanyTab';
import { TeamTab } from './TeamTab';
import { NotificationsTab } from './NotificationsTab';
import { BrandingTab } from './BrandingTab';
import { InventorySettingsTab } from './InventorySettingsTab';
import { DIYBayRatesTab } from './DIYBayRatesTab';
import { WorkOrderNumberingTab } from './WorkOrderNumberingTab';
import { SettingsPageLayout } from './SettingsPageLayout';
import { 
  Building2, 
  Users, 
  Bell, 
  Palette, 
  Package, 
  Wrench,
  Hash
} from 'lucide-react';

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState('company');

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'work-orders', label: 'Work Orders', icon: Hash },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'diy-bays', label: 'DIY Bay Rates', icon: Wrench },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <SettingsPageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your shop settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="company">
            <CompanyTab />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab />
          </TabsContent>

          <TabsContent value="work-orders">
            <WorkOrderNumberingTab />
          </TabsContent>

          <TabsContent value="inventory">
            <InventorySettingsTab />
          </TabsContent>

          <TabsContent value="diy-bays">
            <DIYBayRatesTab />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </SettingsPageLayout>
  );
}
