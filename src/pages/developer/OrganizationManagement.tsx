
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CustomerSelector } from '@/components/developer/CustomerSelector';

// Define our tab type for better type checking
type TabValue = 'organizations' | 'shops' | 'access' | 'customer-preview';

export default function OrganizationManagement() {
  const [activeTab, setActiveTab] = useState<TabValue>('organizations');

  const { data: organizations, isLoading: loadingOrgs, error: orgsError } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: shops, isLoading: loadingShops, error: shopsError } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*, organizations(name)');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: roles, isLoading: loadingRoles, error: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const renderContent = (tab: TabValue) => {
    switch (tab) {
      case 'organizations':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrgs ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : orgsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load organizations: {orgsError instanceof Error ? orgsError.message : 'Unknown error'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 font-medium text-sm text-slate-500 border-b pb-2">
                    <div>ID</div>
                    <div>Name</div>
                    <div>Created At</div>
                  </div>
                  {organizations?.map((org) => (
                    <div key={org.id} className="grid grid-cols-3 text-sm border-b pb-2">
                      <div className="font-mono text-xs">{org.id}</div>
                      <div>{org.name}</div>
                      <div>{new Date(org.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {organizations?.length === 0 && (
                    <div className="text-center py-4 text-slate-500">No organizations found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'shops':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Shops</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingShops ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : shopsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load shops: {shopsError instanceof Error ? shopsError.message : 'Unknown error'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 font-medium text-sm text-slate-500 border-b pb-2">
                    <div>Organization</div>
                    <div>Name</div>
                    <div>Location</div>
                    <div>Active</div>
                  </div>
                  {shops?.map((shop) => (
                    <div key={shop.id} className="grid grid-cols-4 text-sm border-b pb-2">
                      <div>{shop.organizations?.name}</div>
                      <div>{shop.name}</div>
                      <div>{shop.city ? `${shop.city}, ${shop.state}` : 'Not specified'}</div>
                      <div>{shop.is_active ? '✅' : '❌'}</div>
                    </div>
                  ))}
                  {shops?.length === 0 && (
                    <div className="text-center py-4 text-slate-500">No shops found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'access':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRoles ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : rolesError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load roles: {rolesError instanceof Error ? rolesError.message : 'Unknown error'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 font-medium text-sm text-slate-500 border-b pb-2">
                    <div>Role</div>
                    <div>Description</div>
                    <div>Default</div>
                  </div>
                  {roles?.map((role) => (
                    <div key={role.id} className="grid grid-cols-3 text-sm border-b pb-2">
                      <div className="capitalize">{role.name}</div>
                      <div>{role.description || 'No description'}</div>
                      <div>{role.is_default ? '✅' : '❌'}</div>
                    </div>
                  ))}
                  {roles?.length === 0 && (
                    <div className="text-center py-4 text-slate-500">No roles found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'customer-preview':
        return <CustomerSelector />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <p className="text-slate-600">Manage organizations, shops, and user access</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="mb-6">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="customer-preview">Customer Portal Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {renderContent(activeTab)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
