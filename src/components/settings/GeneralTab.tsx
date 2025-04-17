
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTab } from "./AccountTab";
import { CompanyTab } from "./CompanyTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building } from "lucide-react";

export function GeneralTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and company information.
        </p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        
        <TabsContent value="company">
          <CompanyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
