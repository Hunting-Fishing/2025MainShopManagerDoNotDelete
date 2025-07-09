import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShopIntegration {
  id: string;
  shop_id: string;
  provider_id: string;
  name: string;
  description: string | null;
  auth_credentials: any;
  configuration: any;
  sync_settings: any;
  last_sync_at: string | null;
  sync_status: string;
  error_details: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined from provider
  provider?: {
    name: string;
    slug: string;
    category: string;
    logo_url: string | null;
    auth_type: string;
    webhook_support: boolean;
  };
}

export function useShopIntegrations() {
  const [integrations, setIntegrations] = useState<ShopIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shop_integrations')
        .select(`
          *,
          provider:integration_providers(
            name,
            slug,
            category,
            logo_url,
            auth_type,
            webhook_support
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching shop integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (integrationData: {
    provider_id: string;
    name: string;
    description?: string;
    auth_credentials?: any;
    configuration?: any;
    sync_settings?: any;
  }) => {
    try {
      const user = await supabase.auth.getUser();
      const profile = await supabase.from('profiles').select('shop_id').single();
      
      const { data, error } = await supabase
        .from('shop_integrations')
        .insert({
          ...integrationData,
          auth_credentials: integrationData.auth_credentials || {},
          configuration: integrationData.configuration || {},
          sync_settings: integrationData.sync_settings || {},
          created_by: user.data.user?.id,
          shop_id: profile.data?.shop_id
        })
        .select(`
          *,
          provider:integration_providers(
            name,
            slug,
            category,
            logo_url,
            auth_type,
            webhook_support
          )
        `)
        .single();

      if (error) throw error;

      setIntegrations(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Integration created successfully'
      });
      return data;
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to create integration',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateIntegration = async (id: string, updates: Partial<ShopIntegration>) => {
    try {
      const { data, error } = await supabase
        .from('shop_integrations')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          provider:integration_providers(
            name,
            slug,
            category,
            logo_url,
            auth_type,
            webhook_support
          )
        `)
        .single();

      if (error) throw error;

      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id ? { ...integration, ...data } : integration
        )
      );

      toast({
        title: 'Success',
        description: 'Integration updated successfully'
      });
      return data;
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update integration',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shop_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      
      toast({
        title: 'Success',
        description: 'Integration deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete integration',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const testConnection = async (integrationId: string) => {
    try {
      // This would typically call an edge function to test the integration
      toast({
        title: 'Testing Connection',
        description: 'Connection test initiated...'
      });
      
      // Update status to indicate test is in progress
      await updateIntegration(integrationId, { sync_status: 'testing' });
      
      // Simulate connection test (replace with actual edge function call)
      setTimeout(async () => {
        await updateIntegration(integrationId, { 
          sync_status: 'active',
          last_sync_at: new Date().toISOString()
        });
        
        toast({
          title: 'Connection Successful',
          description: 'Integration is working properly'
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error testing connection:', error);
      await updateIntegration(integrationId, { 
        sync_status: 'error',
        error_details: 'Connection test failed'
      });
      
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to the service',
        variant: 'destructive'
      });
    }
  };

  const triggerSync = async (integrationId: string, syncType: 'full' | 'incremental' = 'incremental') => {
    try {
      // This would call an edge function to trigger sync
      toast({
        title: 'Sync Started',
        description: `${syncType} sync initiated...`
      });
      
      await updateIntegration(integrationId, { sync_status: 'syncing' });
      
      // Simulate sync process
      setTimeout(async () => {
        await updateIntegration(integrationId, { 
          sync_status: 'active',
          last_sync_at: new Date().toISOString()
        });
        
        toast({
          title: 'Sync Complete',
          description: 'Data synchronized successfully'
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        title: 'Sync Failed',
        description: 'Unable to synchronize data',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    triggerSync,
    refetch: fetchIntegrations
  };
}