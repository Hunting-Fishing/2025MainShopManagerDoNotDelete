
import React from 'react';
import { ServiceHierarchyManager } from '@/components/developer/service-management/ServiceHierarchyManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Helmet } from 'react-helmet-async';

export default function ServiceManagement() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Service Management | Developer Portal</title>
        <meta name="description" content="Configure available services, subcategories, and jobs with pricing" />
      </Helmet>
      
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Service Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Management</h1>
      </div>
      
      <Tabs defaultValue="work-orders" className="space-y-6">
        <TabsList className="bg-white rounded-full p-1 border shadow-sm">
          <TabsTrigger value="work-orders" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="work-orders" className="space-y-6">
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle>Service Hierarchy</CardTitle>
              <CardDescription>
                Manage service categories, subcategories and line items for work orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceHierarchyManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>
                  Manage products and services that appear on invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Invoice items management coming soon. Create categories for products and services that will appear on customer invoices.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle>Invoice Templates</CardTitle>
                <CardDescription>
                  Configure invoice templates with default items and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Template management coming soon. Design standardized invoice templates for different service types.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-white shadow-md rounded-xl border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle>Service Analytics</CardTitle>
              <CardDescription>
                View service usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Service analytics coming soon. Track most frequently used services, average completion times, and revenue by service category.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
