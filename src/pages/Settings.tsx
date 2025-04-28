
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Cog, User, Building, Shield, Bell, Palette, Database, Globe2, Gift, Package, Users, Mail, Brush, MailPlus, Link, ShieldCheck } from "lucide-react";
import { SettingsCard } from "@/components/settings/SettingsCard";
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
  const navigate = useNavigate();

  const settingsCategories = [
    {
      id: "account",
      title: "Account Settings",
      description: "Manage your profile and preferences",
      icon: User,
    },
    {
      id: "company",
      title: "Company Information",
      description: "Update your business details and address",
      icon: Building,
    },
    {
      id: "security",
      title: "Security",
      description: "Password and authentication settings",
      icon: Shield,
    },
    {
      id: "security-advanced",
      title: "Advanced Security",
      description: "2FA and security protocols",
      icon: ShieldCheck,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email and system notifications",
      icon: Bell,
    },
    {
      id: "branding",
      title: "Branding",
      description: "Customize your shop's branding",
      icon: Palette,
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Customize the look and feel of your account",
      icon: Brush,
    },
    {
      id: "email",
      title: "Email Settings",
      description: "Configure email templates and signatures",
      icon: MailPlus,
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect with third-party services",
      icon: Link,
    },
    {
      id: "loyalty",
      title: "Customer Loyalty",
      description: "Set up your loyalty program",
      icon: Gift,
    },
    {
      id: "inventory",
      title: "Inventory Settings",
      description: "Configure inventory preferences",
      icon: Package,
    },
    {
      id: "team",
      title: "Team History",
      description: "View team member activity logs",
      icon: Users,
    },
    {
      id: "email-scheduling",
      title: "Email Scheduling",
      description: "Set up automated email campaigns",
      icon: Mail,
    },
    {
      id: "export",
      title: "Data Export",
      description: "Export your shop data",
      icon: Database,
    },
    {
      id: "language",
      title: "Language",
      description: "Change your language settings",
      icon: Globe2,
    },
  ];

  const toggleView = (view: string) => {
    setActiveTab(view);
  };

  const handleCardClick = (categoryId: string) => {
    // Navigate to the specific settings page
    navigate(`/settings/${categoryId}`);
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
              onClick={() => handleCardClick(category.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {settingsCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center p-4 hover:bg-muted/10 cursor-pointer"
                  onClick={() => handleCardClick(category.id)}
                >
                  <div className="bg-gray-100 p-2 rounded-full mr-4">
                    <category.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;
