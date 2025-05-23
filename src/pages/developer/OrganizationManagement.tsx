import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BookingPermissionsManager } from '@/components/developer/organization/BookingPermissionsManager';

export default function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Manage your organization, shops, and user permissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger value="general" className="rounded-full text-sm px-4 py-2">
            General
          </TabsTrigger>
          <TabsTrigger value="shops" className="rounded-full text-sm px-4 py-2">
            Shops
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-full text-sm px-4 py-2">
            Users
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          <TabsContent value="general" className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
            <p>General organization settings will appear here.</p>
          </TabsContent>

          <TabsContent value="shops" className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Shop Management</h2>
            
            <BookingPermissionsManager />
            
            <p>Additional shop management features will appear here.</p>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p>User management features will appear here.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
