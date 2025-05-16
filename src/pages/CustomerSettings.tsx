
import React from "react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SettingsCard } from "@/components/settings/SettingsCard";

const CustomerSettings = () => {
  const customerSettings = [
    {
      id: "loyalty",
      title: "Customer Loyalty",
      description: "Set up your loyalty program",
      icon: Gift,
      path: "/settings/loyalty",
      color: "purple"
    },
    {
      id: "communications",
      title: "Customer Communications",
      description: "Configure customer communication preferences",
      icon: MessageSquare,
      path: "/settings/communications",
      color: "blue"
    },
    {
      id: "profiles",
      title: "Customer Profiles",
      description: "Manage customer profile settings and defaults",
      icon: User,
      path: "/settings/customer-profiles",
      color: "green"
    }
  ];

  return (
    <SettingsPageLayout
      title="Customer Settings"
      description="Manage all customer-related configurations"
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Customer Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure how your shop interacts with customers, including loyalty programs, 
            communications, and profile management.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerSettings.map((setting) => (
          <SettingsCard
            key={setting.id}
            title={setting.title}
            description={setting.description}
            icon={setting.icon}
            path={setting.path}
            color={setting.color}
          />
        ))}
      </div>
    </SettingsPageLayout>
  );
};

export default CustomerSettings;
