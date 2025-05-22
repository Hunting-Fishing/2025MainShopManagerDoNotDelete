
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

// Organization Tab Component
const OrganizationsTab = () => {
  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error loading organizations</h3>
        <p className="text-red-600">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {organizations.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No organizations found</h3>
          <p className="text-gray-500">Organizations will appear here once created.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:border-blue-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle>{org.name}</CardTitle>
                <CardDescription>ID: {org.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(org.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(org.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Shops Tab Component
const ShopsTab = () => {
  const { data: shops, isLoading, error } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*, organizations(name)')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error loading shops</h3>
        <p className="text-red-600">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shops.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No shops found</h3>
          <p className="text-gray-500">Shops will appear here once created.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {shops.map((shop) => (
            <Card key={shop.id} className="hover:border-blue-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle>{shop.name}</CardTitle>
                <CardDescription>
                  Organization: {shop.organizations?.name || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {shop.email || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {shop.phone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> {shop.address || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${shop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {shop.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Access Controls Tab Component
const AccessControlsTab = () => {
  const { data: userRoles, isLoading, error } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          roles(id, name, description),
          profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error loading access controls</h3>
        <p className="text-red-600">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userRoles.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No user roles found</h3>
          <p className="text-gray-500">User roles will appear here once assigned.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {userRoles.map((userRole) => (
            <Card key={userRole.id} className="hover:border-blue-300 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle>
                  {userRole.profiles?.first_name || ''} {userRole.profiles?.last_name || ''}
                </CardTitle>
                <CardDescription>
                  {userRole.profiles?.email || 'No email'} - Role: {userRole.roles?.name || 'Unknown'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">Role Description:</p>
                  <p className="text-gray-600">{userRole.roles?.description || 'No description available'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState("organizations");

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-blue-500 p-6 rounded-xl mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Organization Management</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Manage your organizations, shops, and user access controls from this dashboard.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="access-controls">Access Controls</TabsTrigger>
        </TabsList>
        <TabsContent value="organizations">
          <OrganizationsTab />
        </TabsContent>
        <TabsContent value="shops">
          <ShopsTab />
        </TabsContent>
        <TabsContent value="access-controls">
          <AccessControlsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
