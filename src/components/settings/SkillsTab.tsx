
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtvUtvSkillsManager } from "./skills/AtvUtvSkillsManager";
import { VehicleSkillsManager } from "./skills/VehicleSkillsManager";
import { MechanicalSkillsManager } from "./skills/MechanicalSkillsManager";
import { ElectricalSkillsManager } from "./skills/ElectricalSkillsManager";
import { MaintenanceSkillsManager } from "./skills/MaintenanceSkillsManager";
import { PerformanceSkillsManager } from "./skills/PerformanceSkillsManager";
import { EquipmentSkillsManager } from "./skills/EquipmentSkillsManager";

export function SkillsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skills Management</h2>
        <p className="text-muted-foreground">
          Manage skill categories and their associated skills for team members.
        </p>
      </div>

      <Tabs defaultValue="mechanical">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="mechanical">Mechanical</TabsTrigger>
          <TabsTrigger value="electrical">Electrical</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="atv-utv">ATV/UTV</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
        </TabsList>

        <TabsContent value="mechanical" className="space-y-4">
          <MechanicalSkillsManager />
        </TabsContent>
        
        <TabsContent value="electrical" className="space-y-4">
          <ElectricalSkillsManager />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceSkillsManager />
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <VehicleSkillsManager />
        </TabsContent>

        <TabsContent value="atv-utv" className="space-y-4">
          <AtvUtvSkillsManager />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceSkillsManager />
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <EquipmentSkillsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
