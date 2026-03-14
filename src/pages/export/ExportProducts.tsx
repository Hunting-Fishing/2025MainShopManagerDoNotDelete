import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Loader2, Package, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { ExportProductForm, getEmptyForm, formToInsert, productToForm } from '@/components/export/products/ExportProductForm';
import { ExportProductDetail } from '@/components/export/products/ExportProductDetail';
import type { ProductFormData } from '@/components/export/products/ExportProductForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const catLabel = (c: string) => ({ dehydrated_food: 'Dehydrated Food', salt: 'Salt', vehicle: 'Vehicle', other: 'Other' }[c] || c);

export default function ExportProducts() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [form, setForm] = useState<ProductFormData>(getEmptyForm());
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    const { data } = await supabase.from('export_products').select('*').eq('shop_id', shopId).order('name');
    setProducts(data || []);
    setLoading(false);
  }, [shopId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!shopId || !form.name) return;
    setSaving(true);
    const payload = formToInsert(form, shopId);

    if (editingProduct) {
      const { error } = await supabase.from('export_products').update(payload).eq('id', editingProduct.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      toast({ title: 'Product updated' });
    } else {
      const { error } = await supabase.from('export_products').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      toast({ title: 'Product added' });
    }
    setDialogOpen(false);
    setEditingProduct(null);
    setForm(getEmptyForm());
    setSaving(false);
    fetchData();
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setDialogOpen(true);
    setSelectedProduct(null);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(getEmptyForm());
    setDialogOpen(true);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  // Summary stats
  const totalProducts = products.length;
  const avgMargin = products.length > 0
    ? (products.reduce((s, p) => s + Number(p.profit_margin_pct || 0), 0) / products.length)
    : 0;
  const totalRevenue = products.reduce((s, p) => s + Number(p.total_revenue || 0), 0);

  if (selectedProduct) {
    return (
      <div className="p-4 md:p-6">
        <ExportProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onEdit={() => openEdit(selectedProduct)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Export Products</h1>
          <p className="text-xs text-muted-foreground">{totalProducts} products</p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Package className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold text-foreground">{totalProducts}</p>
            <p className="text-xs text-muted-foreground">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold text-foreground">{avgMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-32 h-9">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="salt">Salt</SelectItem>
            <SelectItem value="dehydrated_food">Dehydrated Food</SelectItem>
            <SelectItem value="vehicle">Vehicle</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No products found</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first export product to get started</p>
          <Button size="sm" onClick={openCreate} className="mt-3 gap-1"><Plus className="h-4 w-4" /> Add Product</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const margin = Number(p.profit_margin_pct || 0);
            const landed = Number(p.landed_cost_per_unit || 0);
            const sell = Number(p.unit_price || 0);
            const isProfit = margin >= 0;

            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.99]"
                onClick={() => setSelectedProduct(p)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{catLabel(p.category)}</Badge>
                        {p.sku && <span className="text-[10px] text-muted-foreground">{p.sku}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">${sell.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/{p.unit_of_measure}</span></p>
                      <div className={`flex items-center gap-0.5 justify-end text-xs ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{margin}%</span>
                      </div>
                    </div>
                  </div>
                  {landed > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Cost: ${landed.toFixed(2)}</span>
                      <span>•</span>
                      <span>Profit: ${(sell - landed).toFixed(2)}/{p.unit_of_measure}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Sheet open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingProduct(null); setForm(getEmptyForm()); } }}>
        <SheetContent side="bottom" className="h-[92vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 pb-20">
            <ExportProductForm form={form} setForm={setForm} />
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
              <Button onClick={handleSave} disabled={saving || !form.name} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
