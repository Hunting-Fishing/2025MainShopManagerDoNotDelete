import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, AlertTriangle, BarChart, Settings } from 'lucide-react';
import { PermissionsManager } from '@/components/enterprise/PermissionsManager';
import { AuditTrailViewer } from '@/components/enterprise/AuditTrailViewer';
import { SecurityEventsMonitor } from '@/components/enterprise/SecurityEventsMonitor';
import { BIReportManager } from '@/components/enterprise/BIReportManager';

export default function Enterprise() {
  const [activeTab, setActiveTab] = useState('permissions');

  return (
    <>
      <Helmet>
        <title>Enterprise & Security | ServicePro</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Enterprise & Security
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage permissions, security, audit trails, and business intelligence
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Trail</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">BI Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <PermissionsManager />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <AuditTrailViewer />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecurityEventsMonitor />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <BIReportManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              System settings configuration coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
