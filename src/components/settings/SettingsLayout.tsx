
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "./AccountTab";
import { NotificationsTab } from "./NotificationsTab";
import { CompanyTab } from "./CompanyTab";
import { BrandingTab } from "./BrandingTab";
import DataExportTab from "./DataExportTab";

export function SettingsLayout() {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="data-export">Data Export</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AccountTab />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
      <TabsContent value="company">
        <CompanyTab />
      </TabsContent>
      <TabsContent value="branding">
        <BrandingTab />
      </TabsContent>
      <TabsContent value="data-export">
        <DataExportTab />
      </TabsContent>
    </Tabs>
  );
}
