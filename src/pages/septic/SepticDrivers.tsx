import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Users, Phone, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SepticDrivers() {
  const navigate = useNavigate();
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', cdl_number: '' });

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['septic-drivers', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase.from('septic_drivers').select('*').eq('shop_id', shopId).order('last_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  const addDriver = useMutation({
    mutationFn: async () => {
      if (!shopId) throw new Error('No shop');
      const { error } = await supabase.from('septic_drivers').insert({
        shop_id: shopId, first_name: form.first_name, last_name: form.last_name,
        phone: form.phone || null, email: form.email || null, cdl_number: form.cdl_number || null, status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Driver added');
      queryClient.invalidateQueries({ queryKey: ['septic-drivers'] });
      setShowAdd(false);
      setForm({ first_name: '', last_name: '', phone: '', email: '', cdl_number: '' });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusColor = (s: string) => s === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-stone-600 to-stone-800"><Plus className="h-4 w-4 mr-2" />Add Driver</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : drivers.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground mb-4">No drivers added</p><Button onClick={() => setShowAdd(true)} variant="outline">Add first driver</Button></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {drivers.map((d: any) => (
            <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/septic/drivers/${d.id}`)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{d.first_name} {d.last_name}</span>
                    <Badge className={statusColor(d.status)}>{d.status}</Badge>
                    {d.cdl_number && <Badge variant="outline" className="text-xs">CDL</Badge>}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {d.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</span>}
                    {d.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Driver</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={form.first_name} onChange={(e) => setForm(p => ({ ...p, first_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.last_name} onChange={(e) => setForm(p => ({ ...p, last_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>CDL Number</Label><Input value={form.cdl_number} onChange={(e) => setForm(p => ({ ...p, cdl_number: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => addDriver.mutate()} disabled={!form.first_name || !form.last_name || addDriver.isPending}>{addDriver.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
