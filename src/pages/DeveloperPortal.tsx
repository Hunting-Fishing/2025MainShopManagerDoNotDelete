import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Store, Hammer, Users, Wrench, BarChart3, Shield, Link as LinkIcon } from "lucide-react";
import { Container, Segment, Header as SemanticHeader, Grid } from "semantic-ui-react";

export default function DeveloperPortal() {
  const adminModules = [
    {
      id: "shopping-controls",
      title: "Shopping Controls",
      description: "Manage affiliate products, categories, and user submissions",
      icon: <Store className="h-6 w-6 text-blue-600" />,
      href: "/developer/shopping-controls",
    },
    {
      id: "service-management",
      title: "Service Management",
      description: "Configure available services, subcategories, and jobs with pricing",
      icon: <Wrench className="h-6 w-6 text-purple-600" />,
      href: "/developer/service-management",
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect and manage third-party service integrations",
      icon: <LinkIcon className="h-6 w-6 text-green-600" />,
      href: "/developer/integrations",
    },
    {
      id: "user-management",
      title: "User Management",
      description: "Manage application users and their permissions",
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      href: "/developer/user-management",
    },
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure application-wide settings",
      icon: <Settings className="h-6 w-6 text-emerald-600" />,
      href: "/developer/system-settings",
    },
    {
      id: "tools-management",
      title: "Tool Management",
      description: "Manage tools, equipment, and their categories",
      icon: <Hammer className="h-6 w-6 text-amber-600" />,
      href: "/developer/tools-management",
    },
    {
      id: "analytics-dashboard",
      title: "Analytics Dashboard",
      description: "View comprehensive analytics and reporting",
      icon: <BarChart3 className="h-6 w-6 text-rose-600" />,
      href: "/developer/analytics-dashboard",
    },
    {
      id: "security-settings",
      title: "Security Settings",
      description: "Manage security configurations and access controls",
      icon: <Shield className="h-6 w-6 text-cyan-600" />,
      href: "/developer/security-settings",
    },
  ];

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <SemanticHeader as="h1" className="text-3xl font-bold">Developer Portal</SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Advanced controls and management tools for application administrators
            </p>
          </div>
          <Button asChild variant="outline" className="self-start">
            <Link to="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </Segment>

      <Grid columns={3} stackable doubling>
        {adminModules.map((module) => (
          <Grid.Column key={module.id}>
            <Card className="h-full transition-all hover:shadow-lg hover:border-blue-300 border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-slate-800 rounded-lg">
                    {module.icon}
                  </div>
                </div>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                  <Link to={module.href}>Access {module.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
      
      <div className="mt-10 p-4 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 rounded-xl">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <h3 className="font-semibold text-amber-800 dark:text-amber-400">Restricted Access</h3>
        </div>
        <p className="mt-2 text-amber-700 dark:text-amber-300">
          The Developer Portal is restricted to authorized personnel only. Actions performed here directly affect the application's functionality.
        </p>
      </div>
    </Container>
  );
}
