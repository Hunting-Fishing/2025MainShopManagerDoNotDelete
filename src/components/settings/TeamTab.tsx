
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentManager } from "./team/DepartmentManager";

export function TeamTab() {
  return (
    <Tabs defaultValue="departments">
      <TabsList className="mb-4">
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>
      
      <TabsContent value="departments" className="space-y-4">
        <DepartmentManager />
      </TabsContent>
      
      <TabsContent value="roles" className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Role Management</h4>
          <p className="text-sm text-muted-foreground">
            Role management interface will be available in the next update. For now, you can manage roles in the Team section.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
