
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtvUtvSkillsManager } from "./skills/AtvUtvSkillsManager";

export function SkillsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skills Management</h2>
        <p className="text-muted-foreground">
          Manage skill categories and their associated skills for team members.
        </p>
      </div>

      <Tabs defaultValue="atv-utv">
        <TabsList>
          <TabsTrigger value="atv-utv">ATV/UTV Skills</TabsTrigger>
          {/* Add more skill category tabs as needed */}
        </TabsList>
        <TabsContent value="atv-utv" className="space-y-4">
          <AtvUtvSkillsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
