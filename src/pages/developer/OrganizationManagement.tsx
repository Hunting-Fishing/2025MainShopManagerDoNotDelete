
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Building, Store, Users, ArrowLeft, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState("organizations");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: organizations,
    isLoading: orgsLoading,
    error: orgsError,
    refetch: refetchOrgs
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, shops(count)')
        .ilike('name', `%${searchTerm}%`);
      
      if (error) throw error;
      return data;
    }
  });

  const {
    data: shops,
    isLoading: shopsLoading,
    error: shopsError,
    refetch: refetchShops
  } = useQuery({
    queryKey: ['shops', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*, organizations(name)')
        .ilike('name', `%${searchTerm}%`);
      
      if (error) throw error;
      return data;
    }
  });

  const handleRefresh = () => {
    if (activeTab === "organizations") {
      refetchOrgs();
      toast.success("Organizations refreshed");
    } else if (activeTab === "shops") {
      refetchShops();
      toast.success("Shops refreshed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
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
            <BreadcrumbPage>Organization Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/developer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Organization Management</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" /> 
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
            <TabsTrigger value="organizations" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Building className="h-4 w-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="shops" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Store className="h-4 w-4 mr-2" />
              Shops
            </TabsTrigger>
            <TabsTrigger value="access" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Access Controls
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card className="bg-white border-gray-100 shadow-md rounded-xl p-6">
          <TabsContent value="organizations" className="m-0">
            {orgsLoading ? (
              <div className="flex justify-center p-8">
                <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
              </div>
            ) : orgsError ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                Error loading organizations. Please try again.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Shops</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations && organizations.length > 0 ? (
                    organizations.map((org: any) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {org.shops[0]?.count || 0} shops
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No organizations matching your search' : 'No organizations found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="shops" className="m-0">
            {shopsLoading ? (
              <div className="flex justify-center p-8">
                <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
              </div>
            ) : shopsError ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                Error loading shops. Please try again.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops && shops.length > 0 ? (
                    shops.map((shop: any) => (
                      <TableRow key={shop.id}>
                        <TableCell className="font-medium">{shop.name}</TableCell>
                        <TableCell>{shop.organizations?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(shop.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No shops matching your search' : 'No shops found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="access" className="m-0">
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-md mb-6">
              <p className="text-amber-700">
                This section allows you to manage access permissions for organizations and shops.
                You can view and modify user roles, permissions, and access controls.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role Assignments</CardTitle>
                  <CardDescription>Manage user roles across organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    View and modify user role assignments for organizations and shops.
                  </p>
                  <Button>Manage Roles</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Permission Sets</CardTitle>
                  <CardDescription>Configure permission templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Create and manage permission sets that can be assigned to roles.
                  </p>
                  <Button>Manage Permissions</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
