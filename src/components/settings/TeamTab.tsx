
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
        <p className="text-muted-foreground">Role management will be implemented in the future.</p>
      </TabsContent>
    </Tabs>
  );
}
