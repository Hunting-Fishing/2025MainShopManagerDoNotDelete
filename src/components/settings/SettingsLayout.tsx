
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "./GeneralTab";
import { AppearanceTab } from "./AppearanceTab";
import { NotificationsTab } from "./NotificationsTab";
import { IntegrationsTab } from "./IntegrationsTab";
import { SecurityTab } from "./SecurityTab";
import { BrandingTab } from "./BrandingTab";
import { SkillsTab } from "./SkillsTab";

export function SettingsLayout() {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">
          General
        </TabsTrigger>
        <TabsTrigger value="appearance">
          Appearance
        </TabsTrigger>
        <TabsTrigger value="branding">
          Branding
        </TabsTrigger>
        <TabsTrigger value="notifications">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="integrations">
          Integrations
        </TabsTrigger>
        <TabsTrigger value="security">
          Security
        </TabsTrigger>
        <TabsTrigger value="skills">
          Skills
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralTab />
      </TabsContent>
      <TabsContent value="appearance">
        <AppearanceTab />
      </TabsContent>
      <TabsContent value="branding">
        <BrandingTab />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
      <TabsContent value="integrations">
        <IntegrationsTab />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>
      <TabsContent value="skills">
        <SkillsTab />
      </TabsContent>
    </Tabs>
  );
}
