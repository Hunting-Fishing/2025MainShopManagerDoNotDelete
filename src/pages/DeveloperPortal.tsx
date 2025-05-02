
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Store, Hammer, Users, Wrench } from "lucide-react";
import { Container, Segment, Header as SemanticHeader, Message, Grid, Icon } from "semantic-ui-react";

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
      href: "/developer/user-management",
    },
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure application-wide settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/developer/system-settings",
    },
    {
      id: "tools-management",
      title: "Tool Management",
      description: "Manage tools, equipment, and their categories",
      icon: <Hammer className="h-6 w-6" />,
      href: "/developer/tools-management",
    },
    {
      id: "service-management",
      title: "Service Management",
      description: "Configure available services and pricing",
      icon: <Wrench className="h-6 w-6" />,
      href: "/developer/service-management",
    },
  ];

  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
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
            <Card className="h-full transition-all hover:shadow-lg border-t-4 border-t-blue-500">
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
                <Button asChild className="w-full" variant="outline">
                  <Link to={module.href}>Access {module.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
      
      <Message warning icon className="mt-10">
        <Icon name="warning sign" />
        <Message.Content>
          <Message.Header>Restricted Access</Message.Header>
          <p>
            The Developer Portal is restricted to authorized personnel only. Actions performed here directly affect the application's functionality.
          </p>
        </Message.Content>
      </Message>
    </Container>
  );
}
