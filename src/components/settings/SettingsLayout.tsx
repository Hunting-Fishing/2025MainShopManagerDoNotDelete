
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, UserRound, Bell, Shield, Building, Palette } from "lucide-react";
import { AccountTab } from "./AccountTab";
import { NotificationsTab } from "./NotificationsTab";
import { CompanyTab } from "./CompanyTab";
import { BrandingTab } from "./BrandingTab";
import { SecurityTab } from "./SecurityTab";

interface SettingsLayoutProps {
  defaultTab?: string;
}

export function SettingsLayout({ defaultTab = "account" }: SettingsLayoutProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="bg-white dark:bg-gray-950 border">
        <TabsTrigger value="account" className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="company" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="hidden sm:inline">Company</span>
        </TabsTrigger>
        <TabsTrigger value="branding" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Branding</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="space-y-4">
        <AccountTab />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <NotificationsTab />
      </TabsContent>

      <TabsContent value="company" className="space-y-4">
        <CompanyTab />
      </TabsContent>

      <TabsContent value="branding" className="space-y-4">
        <BrandingTab />
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <SecurityTab />
      </TabsContent>
    </Tabs>
  );
}
