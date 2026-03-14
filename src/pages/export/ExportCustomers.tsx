import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Loader2, Globe } from 'lucide-react';

export default function ExportCustomers() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', country: '', city: '', address: '', port_of_destination: '', trade_terms: 'FOB', currency: 'USD', tax_id: '', notes: '' });

  const fetch = async () => {
    if (!shopId) return;
    setLoading(true);
    const { data } = await supabase.from('export_customers').select('*').eq('shop_id', shopId).order('company_name');
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [shopId]);

  const handleCreate = async () => {
    if (!shopId || !form.company_name || !form.country) return;
    const { error } = await supabase.from('export_customers').insert({ ...form, shop_id: shopId });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Customer added' });
    setDialogOpen(false);
    setForm({ company_name: '', contact_name: '', email: '', phone: '', country: '', city: '', address: '', port_of_destination: '', trade_terms: 'FOB', currency: 'USD', tax_id: '', notes: '' });
    fetch();
  };

  const filtered = customers.filter(c => c.company_name.toLowerCase().includes(search.toLowerCase()) || c.country?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Export Customers</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Customer</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add International Buyer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Company Name *</Label><Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} /></div>
              <div><Label>Contact Name</Label><Input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Country *</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Port of Destination</Label><Input value={form.port_of_destination} onChange={e => setForm(p => ({ ...p, port_of_destination: e.target.value }))} /></div>
                <div><Label>Tax ID</Label><Input value={form.tax_id} onChange={e => setForm(p => ({ ...p, tax_id: e.target.value }))} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <Button onClick={handleCreate} className="w-full">Add Customer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search customers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : filtered.length === 0 ? <p className="text-center text-muted-foreground py-8">No customers found</p> : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center"><Globe className="h-5 w-5 text-white" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{c.company_name}</p>
                    <p className="text-sm text-muted-foreground">{c.contact_name || 'No contact'} • {c.country}{c.city ? `, ${c.city}` : ''}</p>
                    <p className="text-xs text-muted-foreground">{c.email || ''} {c.phone ? `• ${c.phone}` : ''} • {c.trade_terms} • {c.currency}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
