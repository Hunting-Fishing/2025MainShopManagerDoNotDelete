
import React from 'react';
import ServiceHierarchyManager from '@/components/developer/service-management/ServiceHierarchyManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ServiceManagement() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Service Management</h1>
      
      <Tabs defaultValue="work-orders" className="space-y-6">
        <TabsList className="bg-white rounded-full p-1 border shadow-sm">
          <TabsTrigger value="work-orders" className="rounded-full text-sm px-4 py-2">
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-full text-sm px-4 py-2">
            Invoices
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="work-orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle>Line Codes</CardTitle>
                <CardDescription>
                  Manage service categories, subcategories and line items for work orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceHierarchyManager />
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md rounded-xl border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle>Templates</CardTitle>
                <CardDescription>
                  Configure work order templates with predefined services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Templates feature coming soon. Create standardized work order templates with common service combinations.
                </p>
              </CardContent>
            </Card>
          </div>
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
      </Tabs>
    </div>
  );
}
