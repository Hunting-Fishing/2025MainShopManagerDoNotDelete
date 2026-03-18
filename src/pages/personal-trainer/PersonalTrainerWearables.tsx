import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Watch, Loader2, Link, Unlink, RefreshCw, Activity, Sparkles } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useSaveBiometricSnapshot } from '@/hooks/usePTAIInsights';

const PROVIDERS = [
  { id: 'fitbit', name: 'Fitbit', color: 'bg-teal-100 text-teal-800' },
  { id: 'apple_health', name: 'Apple Health', color: 'bg-gray-100 text-gray-800' },
  { id: 'garmin', name: 'Garmin', color: 'bg-blue-100 text-blue-800' },
  { id: 'google_fit', name: 'Google Fit', color: 'bg-green-100 text-green-800' },
  { id: 'whoop', name: 'WHOOP', color: 'bg-orange-100 text-orange-800' },
];

export default function PersonalTrainerWearables() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const saveBiometric = useSaveBiometricSnapshot();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [connectDialog, setConnectDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['pt-wearable-clients', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await (supabase as any).from('pt_clients').select('id, first_name, last_name').eq('shop_id', shopId).eq('membership_status', 'active').order('first_name');
      return data || [];
    },
    enabled: !!shopId,
  });

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['pt-wearable-connections', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      const { data } = await (supabase as any).from('pt_wearable_connections').select('*').eq('client_id', selectedClient).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!selectedClient,
  });

  const connectDevice = useMutation({
    mutationFn: async () => {
      if (!selectedClient || !selectedProvider) throw new Error('Select client and provider');
      const { error } = await (supabase as any).from('pt_wearable_connections').insert({
        client_id: selectedClient, provider: selectedProvider, connection_status: 'connected',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-wearable-connections'] });
      setConnectDialog(false);
      setSelectedProvider('');
      toast({ title: 'Device connected' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const disconnectDevice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('pt_wearable_connections').update({ connection_status: 'disconnected' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-wearable-connections'] });
      toast({ title: 'Device disconnected' });
    },
  });

  const syncDevice = useMutation({
    mutationFn: async (id: string) => {
      // Simulate sync - in production this would call a wearable API
      const { error } = await (supabase as any).from('pt_wearable_connections').update({
        last_synced_at: new Date().toISOString(),
        sync_data: { steps: Math.floor(Math.random() * 12000) + 3000, heart_rate: Math.floor(Math.random() * 30) + 60, calories_burned: Math.floor(Math.random() * 500) + 200 },
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-wearable-connections'] });
      toast({ title: 'Data synced' });
    },
  });

  const statusColors: Record<string, string> = { connected: 'bg-green-100 text-green-800', disconnected: 'bg-gray-100 text-gray-700', pending: 'bg-yellow-100 text-yellow-800', error: 'bg-red-100 text-red-800' };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Watch className="h-6 w-6 text-cyan-500" />Wearable Integrations</h1>
          <p className="text-muted-foreground text-sm">Connect and sync client wearable devices</p>
        </div>
        <Button onClick={() => setConnectDialog(true)} disabled={!selectedClient} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <Link className="h-4 w-4 mr-2" />Connect Device
        </Button>
      </div>

      <div className="max-w-xs">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
          <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {selectedClient && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /></div>
          ) : connections.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Watch className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No wearable devices connected</p></CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connections.map((conn: any) => {
                const provider = PROVIDERS.find(p => p.id === conn.provider);
                const syncData = conn.sync_data as any;
                return (
                  <Card key={conn.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{provider?.name || conn.provider}</CardTitle>
                        <Badge className={statusColors[conn.connection_status] || statusColors.pending}>{conn.connection_status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {conn.last_synced_at && (
                        <p className="text-xs text-muted-foreground">Last sync: {format(new Date(conn.last_synced_at), 'MMM d, h:mm a')}</p>
                      )}
                      {syncData && (
                        <div className="grid grid-cols-3 gap-2">
                          {syncData.steps && <div className="p-2 rounded bg-muted/50 text-center"><p className="font-bold text-sm">{syncData.steps.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Steps</p></div>}
                          {syncData.heart_rate && <div className="p-2 rounded bg-muted/50 text-center"><p className="font-bold text-sm">{syncData.heart_rate}</p><p className="text-[10px] text-muted-foreground">BPM</p></div>}
                          {syncData.calories_burned && <div className="p-2 rounded bg-muted/50 text-center"><p className="font-bold text-sm">{syncData.calories_burned}</p><p className="text-[10px] text-muted-foreground">Cal</p></div>}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {conn.connection_status === 'connected' && (
                          <>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => syncDevice.mutate(conn.id)} disabled={syncDevice.isPending}>
                              <RefreshCw className="h-3 w-3 mr-1" />Sync
                            </Button>
                            {syncData && shopId && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => saveBiometric.mutate({
                                  clientId: selectedClient,
                                  shopId,
                                  syncData: { steps: syncData.steps, heart_rate: syncData.heart_rate, calories_burned: syncData.calories_burned },
                                  source: conn.provider,
                                })}
                                disabled={saveBiometric.isPending}
                              >
                                <Sparkles className="h-3 w-3 mr-1" />Profile
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => disconnectDevice.mutate(conn.id)}>
                              <Unlink className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog open={connectDialog} onOpenChange={setConnectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect Wearable Device</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a wearable provider to connect for this client.</p>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS
                .filter(p => !connections.some((c: any) => c.provider === p.id && c.connection_status === 'connected'))
                .map(p => (
                  <Button
                    key={p.id}
                    variant={selectedProvider === p.id ? 'default' : 'outline'}
                    className="h-16 flex-col gap-1"
                    onClick={() => setSelectedProvider(p.id)}
                  >
                    <Watch className="h-5 w-5" />
                    <span className="text-xs">{p.name}</span>
                  </Button>
                ))}
            </div>
            <Button onClick={() => connectDevice.mutate()} disabled={!selectedProvider || connectDevice.isPending} className="w-full">
              {connectDevice.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link className="h-4 w-4 mr-2" />}
              Connect Device
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
