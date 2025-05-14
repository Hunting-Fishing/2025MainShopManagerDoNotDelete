
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cog, User, Building, Shield, Bell, Database, Globe2, Gift, Package, Users, Mail, Brush, MailPlus, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Main Settings component
const Settings = () => {
  const [activeTab, setActiveTab] = useState("grid");

  const settingsCategories = [
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your profile, preferences, and company information",
      icon: User,
      path: "/settings/account",
      color: "indigo"
    },
    {
      id: "security",
      title: "Security",
      description: "Password and authentication settings",
      icon: Shield,
      path: "/settings/security",
      color: "green"
    },
    {
      id: "security-advanced",
      title: "Advanced Security",
      description: "2FA and security protocols",
      icon: ShieldCheck,
      path: "/settings/security-advanced",
      color: "yellow"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email and system notifications",
      icon: Bell,
      path: "/settings/notifications",
      color: "red"
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Customize the look and feel of your account",
      icon: Brush,
      path: "/settings/appearance",
      color: "purple"
    },
    {
      id: "email",
      title: "Email Settings",
      description: "Configure email templates and signatures",
      icon: MailPlus,
      path: "/settings/email",
      color: "blue"
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect with third-party services",
      icon: LinkIcon,
      path: "/settings/integrations",
      color: "yellow"
    },
    {
      id: "loyalty",
      title: "Customer Loyalty",
      description: "Set up your loyalty program",
      icon: Gift,
      path: "/settings/loyalty",
      color: "purple"
    },
    {
      id: "inventory",
      title: "Inventory Settings",
      description: "Configure inventory preferences",
      icon: Package,
      path: "/settings/inventory",
      color: "green"
    },
    {
      id: "team",
      title: "Team History",
      description: "View team member activity logs",
      icon: Users,
      path: "/settings/team",
      color: "red"
    },
    {
      id: "email-scheduling",
      title: "Email Scheduling",
      description: "Set up automated email campaigns",
      icon: Mail,
      path: "/settings/email-scheduling",
      color: "blue"
    },
    {
      id: "export",
      title: "Data Export",
      description: "Export your shop data",
      icon: Database,
      path: "/settings/export",
      color: "indigo"
    },
    {
      id: "language",
      title: "Language",
      description: "Change your language settings",
      icon: Globe2,
      path: "/settings/language",
      color: "green"
    },
  ];

  const toggleView = (view: string) => {
    setActiveTab(view);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex space-x-2 bg-muted/20 rounded-md p-1">
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === "list" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => toggleView("list")}
          >
            List View
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === "grid" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => toggleView("grid")}
          >
            Grid View
          </button>
        </div>
      </div>

      {activeTab === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCategories.map((category) => (
            <SettingsCard
              key={category.id}
              title={category.title}
              description={category.description}
              icon={category.icon}
              path={category.path}
              color={category.color}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {settingsCategories.map((category) => (
                <Link 
                  to={category.path}
                  key={category.id} 
                  className="block"
                >
                  <div
                    className="flex items-center p-4 hover:bg-muted/10 cursor-pointer"
                  >
                    <div className={`bg-${category.color || 'gray'}-100 p-2 rounded-full mr-4`}>
                      <category.icon className={`h-5 w-5 text-${category.color || 'gray'}-600`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;
