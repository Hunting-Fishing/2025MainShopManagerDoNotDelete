
import React from 'react';
import ServiceHierarchyManager from '@/components/developer/service-management/ServiceHierarchyManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, FileSpreadsheet, BarChart } from 'lucide-react';

export default function ServiceManagement() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-slate-500 mt-1">
            Configure service categories, subcategories, and define jobs with prices and time estimates
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="line-codes" className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <TabsList className="bg-white rounded-full p-1 border shadow-sm">
            <TabsTrigger value="line-codes" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Line Codes
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Templates
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Invoices
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Reports
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="line-codes" className="space-y-6 mt-0 animate-in fade-in-50">
          <ServiceHierarchyManager />
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6 mt-0 animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-slate-500 mr-2" />
                  <CardTitle>Template Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure defaults for service templates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">
                  Template management functionality coming soon. Configure service templates to streamline work order creation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-slate-500 mr-2" />
                  <CardTitle>Service Templates</CardTitle>
                </div>
                <CardDescription>
                  Create and manage service templates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <div className="mb-2 text-lg font-medium">Service Templates</div>
                  <p className="text-slate-500 mb-4">This feature is coming soon. Create standardized work order templates with common service combinations.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6 mt-0 animate-in fade-in-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 text-slate-500 mr-2" />
                  <CardTitle>Invoice Items</CardTitle>
                </div>
                <CardDescription>
                  Manage products and services that appear on invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">
                  Invoice items management coming soon. Create categories for products and services that will appear on customer invoices.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2 bg-slate-50 border-b">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 text-slate-500 mr-2" />
                  <CardTitle>Invoice Templates</CardTitle>
                </div>
                <CardDescription>
                  Configure invoice templates with default items and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">
                  Template management coming soon. Design standardized invoice templates for different service types.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6 mt-0 animate-in fade-in-50">
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="pb-2 bg-slate-50 border-b">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-slate-500 mr-2" />
                <CardTitle>Service Analytics</CardTitle>
              </div>
              <CardDescription>
                View reports and analytics for your services
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-8 border border-dashed rounded-lg">
                <div className="mb-2 text-lg font-medium">Service Reports</div>
                <p className="text-slate-500 mb-4">Analytics and reporting features coming soon. Track service usage, revenue, and popular services.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
