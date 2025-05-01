
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Store, Hammer, Users, Wrench } from "lucide-react";

export default function DeveloperPortal() {
  const adminModules = [
    {
      id: "shopping-controls",
      title: "Shopping Controls",
      description: "Manage affiliate products, categories, and user submissions",
      icon: <Store className="h-6 w-6" />,
      href: "/developer/shopping-controls",
    },
    {
      id: "user-management",
      title: "User Management",
      description: "Manage application users and their permissions",
      icon: <Users className="h-6 w-6" />,
      href: "#",
    },
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure application-wide settings",
      icon: <Settings className="h-6 w-6" />,
      href: "#",
    },
    {
      id: "tools-management",
      title: "Tool Management",
      description: "Manage tools, equipment, and their categories",
      icon: <Hammer className="h-6 w-6" />,
      href: "#",
    },
    {
      id: "service-management",
      title: "Service Management",
      description: "Configure available services and pricing",
      icon: <Wrench className="h-6 w-6" />,
      href: "#",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Portal</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Advanced controls and management tools for application administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Card key={module.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {module.icon}
                </div>
              </div>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={module.href}>Access {module.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-10 p-6 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/30 rounded-lg">
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-500 mb-2">Restricted Access</h3>
        <p className="text-amber-700 dark:text-amber-400">
          The Developer Portal is restricted to authorized personnel only. Actions performed here directly affect the application's functionality.
        </p>
      </div>
    </div>
  );
}
