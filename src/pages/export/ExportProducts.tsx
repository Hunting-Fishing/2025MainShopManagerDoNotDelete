import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Loader2 } from 'lucide-react';

export default function ExportProducts() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'dehydrated_food', sku: '', description: '', unit_of_measure: 'kg', weight_per_unit: '', hs_code: '', country_of_origin: '', unit_price: '', packaging_type: '' });

  const fetchData = async () => { if (!shopId) return; setLoading(true); const { data } = await supabase.from('export_products').select('*').eq('shop_id', shopId).order('name'); setProducts(data || []); setLoading(false); };
  useEffect(() => { fetchData(); }, [shopId]);

  const handleCreate = async () => {
    if (!shopId || !form.name) return;
    const { error } = await supabase.from('export_products').insert({ ...form, shop_id: shopId, weight_per_unit: form.weight_per_unit ? Number(form.weight_per_unit) : null, unit_price: form.unit_price ? Number(form.unit_price) : 0 });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Product added' }); setDialogOpen(false); setForm({ name: '', category: 'dehydrated_food', sku: '', description: '', unit_of_measure: 'kg', weight_per_unit: '', hs_code: '', country_of_origin: '', unit_price: '', packaging_type: '' }); fetchData();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const catLabel = (c: string) => ({ dehydrated_food: 'Dehydrated Food', salt: 'Salt', vehicle: 'Vehicle', other: 'Other' }[c] || c);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Export Products</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dehydrated_food">Dehydrated Food</SelectItem><SelectItem value="salt">Salt</SelectItem><SelectItem value="vehicle">Vehicle</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Unit Price ($)</Label><Input type="number" value={form.unit_price} onChange={e => setForm(p => ({ ...p, unit_price: e.target.value }))} /></div>
                <div><Label>Weight per Unit</Label><Input type="number" value={form.weight_per_unit} onChange={e => setForm(p => ({ ...p, weight_per_unit: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>HS Code</Label><Input value={form.hs_code} onChange={e => setForm(p => ({ ...p, hs_code: e.target.value }))} /></div>
                <div><Label>Country of Origin</Label><Input value={form.country_of_origin} onChange={e => setForm(p => ({ ...p, country_of_origin: e.target.value }))} /></div>
              </div>
              <div><Label>Packaging Type</Label><Input value={form.packaging_type} onChange={e => setForm(p => ({ ...p, packaging_type: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <Button onClick={handleCreate} className="w-full">Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : filtered.length === 0 ? <p className="text-center text-muted-foreground py-8">No products found</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id}><CardContent className="p-4">
              <p className="font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{catLabel(p.category)} • {p.sku || 'No SKU'}</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">${Number(p.unit_price || 0).toFixed(2)} / {p.unit_of_measure}</span>
                <span className="text-muted-foreground">{p.hs_code || 'No HS code'}</span>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
