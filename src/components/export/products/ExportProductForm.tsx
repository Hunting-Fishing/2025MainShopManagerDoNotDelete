import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DollarSign, Package, Truck, Shield, BarChart3, Lock, Info, Plus, Calculator } from 'lucide-react';
import { ExportCategoryPicker } from './ExportCategoryPicker';
import { useExportPackagingTypes } from '@/hooks/export/useExportPackagingTypes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface ProductFormData {
  name: string;
  category: string;
  category_id: string;
  subcategory_id: string;
  sku: string;
  description: string;
  unit_of_measure: string;
  weight_per_unit: string;
  hs_code: string;
  country_of_origin: string;
  unit_price: string;
  packaging_type: string;
  purchase_cost_per_unit: string;
  shipping_cost_per_unit: string;
  customs_duty_rate: string;
  customs_duty_per_unit: string;
  insurance_cost_per_unit: string;
  handling_fee_per_unit: string;
  packaging_cost_per_unit: string;
  inspection_cost_per_unit: string;
  supplier_name: string;
  supplier_contact: string;
  supplier_country: string;
  supplier_lead_time_days: string;
  minimum_order_qty: string;
  shelf_life_days: string;
  storage_temperature: string;
  storage_requirements: string;
  moisture_content_pct: string;
  grade: string;
  grain_size: string;
  certifications: string;
  export_license_required: boolean;
  phytosanitary_required: boolean;
  fumigation_required: boolean;
  regulatory_notes: string;
  target_markets: string;
  preferred_incoterms: string;
  currency: string;
  sale_currency: string;
  min_margin_threshold: string;
  max_discount_pct: string;
  cost_locked: boolean;
  price_floor: string;
  markup_pct: string;
  cost_review_notes: string;
  tariff_classification: string;
  anti_dumping_duty_pct: string;
  countervailing_duty_pct: string;
  bulk_purchase_price: string;
  bulk_purchase_currency: string;
  bulk_quantity: string;
  bulk_quantity_unit: string;
}

interface ExportProductFormProps {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export const getEmptyForm = (): ProductFormData => ({
  name: '', category: '', category_id: '', subcategory_id: '', sku: '', description: '', unit_of_measure: 'kg',
  weight_per_unit: '', hs_code: '', country_of_origin: '', unit_price: '', packaging_type: '',
  purchase_cost_per_unit: '', shipping_cost_per_unit: '', customs_duty_rate: '',
  customs_duty_per_unit: '', insurance_cost_per_unit: '', handling_fee_per_unit: '',
  packaging_cost_per_unit: '', inspection_cost_per_unit: '',
  supplier_name: '', supplier_contact: '', supplier_country: '', supplier_lead_time_days: '',
  minimum_order_qty: '1', shelf_life_days: '', storage_temperature: '', storage_requirements: '',
  moisture_content_pct: '', grade: '', grain_size: '',
  certifications: '', export_license_required: false, phytosanitary_required: false,
  fumigation_required: false, regulatory_notes: '',
  target_markets: '', preferred_incoterms: 'FOB', currency: 'USD', sale_currency: 'USD',
  min_margin_threshold: '10', max_discount_pct: '15', cost_locked: false,
  price_floor: '0', markup_pct: '0', cost_review_notes: '',
  tariff_classification: '', anti_dumping_duty_pct: '0', countervailing_duty_pct: '0',
  bulk_purchase_price: '', bulk_purchase_currency: 'CAD', bulk_quantity: '', bulk_quantity_unit: 'kg',
});

export const formToInsert = (form: ProductFormData, shopId: string) => ({
  shop_id: shopId,
  name: form.name,
  category: form.category,
  category_id: form.category_id || null,
  subcategory_id: form.subcategory_id || null,
  sku: form.sku || null,
  description: form.description || null,
  unit_of_measure: form.unit_of_measure,
  weight_per_unit: form.weight_per_unit ? Number(form.weight_per_unit) : null,
  hs_code: form.hs_code || null,
  country_of_origin: form.country_of_origin || null,
  unit_price: form.unit_price ? Number(form.unit_price) : 0,
  packaging_type: form.packaging_type || null,
  purchase_cost_per_unit: Number(form.purchase_cost_per_unit) || 0,
  shipping_cost_per_unit: Number(form.shipping_cost_per_unit) || 0,
  customs_duty_rate: Number(form.customs_duty_rate) || 0,
  customs_duty_per_unit: Number(form.customs_duty_per_unit) || 0,
  insurance_cost_per_unit: Number(form.insurance_cost_per_unit) || 0,
  handling_fee_per_unit: Number(form.handling_fee_per_unit) || 0,
  packaging_cost_per_unit: Number(form.packaging_cost_per_unit) || 0,
  inspection_cost_per_unit: Number(form.inspection_cost_per_unit) || 0,
  supplier_name: form.supplier_name || null,
  supplier_contact: form.supplier_contact || null,
  supplier_country: form.supplier_country || null,
  supplier_lead_time_days: form.supplier_lead_time_days ? Number(form.supplier_lead_time_days) : null,
  minimum_order_qty: Number(form.minimum_order_qty) || 1,
  shelf_life_days: form.shelf_life_days ? Number(form.shelf_life_days) : null,
  storage_temperature: form.storage_temperature || null,
  storage_requirements: form.storage_requirements || null,
  moisture_content_pct: form.moisture_content_pct ? Number(form.moisture_content_pct) : null,
  grade: form.grade || null,
  grain_size: form.grain_size || null,
  certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
  export_license_required: form.export_license_required,
  phytosanitary_required: form.phytosanitary_required,
  fumigation_required: form.fumigation_required,
  regulatory_notes: form.regulatory_notes || null,
  target_markets: form.target_markets ? form.target_markets.split(',').map(s => s.trim()).filter(Boolean) : [],
  preferred_incoterms: form.preferred_incoterms,
  currency: form.currency,
  min_margin_threshold: Number(form.min_margin_threshold) || 10,
  max_discount_pct: Number(form.max_discount_pct) || 15,
  cost_locked: form.cost_locked,
  price_floor: Number(form.price_floor) || 0,
  markup_pct: Number(form.markup_pct) || 0,
  cost_review_notes: form.cost_review_notes || null,
  tariff_classification: form.tariff_classification || null,
  anti_dumping_duty_pct: Number(form.anti_dumping_duty_pct) || 0,
  countervailing_duty_pct: Number(form.countervailing_duty_pct) || 0,
});

export const productToForm = (p: any): ProductFormData => ({
  name: p.name || '',
  category: p.category || '',
  category_id: p.category_id || '',
  subcategory_id: p.subcategory_id || '',
  sku: p.sku || '',
  description: p.description || '',
  unit_of_measure: p.unit_of_measure || 'kg',
  weight_per_unit: p.weight_per_unit?.toString() || '',
  hs_code: p.hs_code || '',
  country_of_origin: p.country_of_origin || '',
  unit_price: p.unit_price?.toString() || '',
  packaging_type: p.packaging_type || '',
  purchase_cost_per_unit: p.purchase_cost_per_unit?.toString() || '0',
  shipping_cost_per_unit: p.shipping_cost_per_unit?.toString() || '0',
  customs_duty_rate: p.customs_duty_rate?.toString() || '0',
  customs_duty_per_unit: p.customs_duty_per_unit?.toString() || '0',
  insurance_cost_per_unit: p.insurance_cost_per_unit?.toString() || '0',
  handling_fee_per_unit: p.handling_fee_per_unit?.toString() || '0',
  packaging_cost_per_unit: p.packaging_cost_per_unit?.toString() || '0',
  inspection_cost_per_unit: p.inspection_cost_per_unit?.toString() || '0',
  supplier_name: p.supplier_name || '',
  supplier_contact: p.supplier_contact || '',
  supplier_country: p.supplier_country || '',
  supplier_lead_time_days: p.supplier_lead_time_days?.toString() || '',
  minimum_order_qty: p.minimum_order_qty?.toString() || '1',
  shelf_life_days: p.shelf_life_days?.toString() || '',
  storage_temperature: p.storage_temperature || '',
  storage_requirements: p.storage_requirements || '',
  moisture_content_pct: p.moisture_content_pct?.toString() || '',
  grade: p.grade || '',
  grain_size: p.grain_size || '',
  certifications: (p.certifications || []).join(', '),
  export_license_required: p.export_license_required || false,
  phytosanitary_required: p.phytosanitary_required || false,
  fumigation_required: p.fumigation_required || false,
  regulatory_notes: p.regulatory_notes || '',
  target_markets: (p.target_markets || []).join(', '),
  preferred_incoterms: p.preferred_incoterms || 'FOB',
  currency: p.currency || 'USD',
  sale_currency: p.sale_currency || p.currency || 'USD',
  min_margin_threshold: p.min_margin_threshold?.toString() || '10',
  max_discount_pct: p.max_discount_pct?.toString() || '15',
  cost_locked: p.cost_locked || false,
  price_floor: p.price_floor?.toString() || '0',
  markup_pct: p.markup_pct?.toString() || '0',
  cost_review_notes: p.cost_review_notes || '',
  tariff_classification: p.tariff_classification || '',
  anti_dumping_duty_pct: p.anti_dumping_duty_pct?.toString() || '0',
  countervailing_duty_pct: p.countervailing_duty_pct?.toString() || '0',
  bulk_purchase_price: '',
  bulk_purchase_currency: 'CAD',
  bulk_quantity: '',
  bulk_quantity_unit: 'kg',
});

const UNIT_MAP: Record<string, string> = {
  g: 'Grams', kg: 'Kilograms', lb: 'Pounds', oz: 'Ounces',
  ton: 'Metric Tons', ml: 'Millilitres', L: 'Litres', gal: 'Gallons',
  bag: 'Bags', pallet: 'Pallets', container: 'Containers',
  unit: 'Units', pc: 'Pieces', box: 'Boxes', bbl: 'Barrels'
};

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'HTG', label: 'HTG — Haitian Gourde' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'XOF', label: 'XOF — West African CFA' },
  { value: 'XAF', label: 'XAF — Central African CFA' },
  { value: 'DOP', label: 'DOP — Dominican Peso' },
  { value: 'JMD', label: 'JMD — Jamaican Dollar' },
  { value: 'TTD', label: 'TTD — Trinidad Dollar' },
  { value: 'BBD', label: 'BBD — Barbados Dollar' },
  { value: 'KYD', label: 'KYD — Cayman Dollar' },
  { value: 'BSD', label: 'BSD — Bahamian Dollar' },
];

// Unit conversion to base unit (grams for weight, ml for volume)
const TO_GRAMS: Record<string, number> = { g: 1, kg: 1000, lb: 453.592, oz: 28.3495, ton: 1000000 };
const TO_ML: Record<string, number> = { ml: 1, L: 1000, gal: 3785.41 };

function normalizeToBase(value: number, unit: string): number | null {
  if (TO_GRAMS[unit]) return value * TO_GRAMS[unit];
  if (TO_ML[unit]) return value * TO_ML[unit];
  return null; // non-convertible units like bag, pallet
}

const F = ({ label, info, children }: { label: string; info?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {info && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
            {info}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    {children}
  </div>
);

function CurrencySelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {CURRENCIES.map(c => (
          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function BulkBreakdownCalculator({ form, setForm }: { form: ProductFormData; setForm: React.Dispatch<React.SetStateAction<ProductFormData>> }) {
  const breakdown = useMemo(() => {
    const bulkPrice = Number(form.bulk_purchase_price) || 0;
    const bulkQty = Number(form.bulk_quantity) || 0;
    const sellingWeight = Number(form.weight_per_unit) || 0;
    const sellingPrice = Number(form.unit_price) || 0;

    if (bulkPrice <= 0 || bulkQty <= 0 || sellingWeight <= 0) return null;

    const bulkBase = normalizeToBase(bulkQty, form.bulk_quantity_unit);
    const sellBase = normalizeToBase(sellingWeight, form.unit_of_measure);

    if (bulkBase === null || sellBase === null || sellBase <= 0) return null;

    const yield_ = Math.floor(bulkBase / sellBase);
    if (yield_ <= 0) return null;

    const costPerUnit = bulkPrice / yield_;
    const totalRevenue = yield_ * sellingPrice;
    const grossProfit = totalRevenue - bulkPrice;
    const marginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return { yield: yield_, costPerUnit, totalRevenue, grossProfit, marginPct };
  }, [form.bulk_purchase_price, form.bulk_quantity, form.bulk_quantity_unit, form.weight_per_unit, form.unit_of_measure, form.unit_price]);

  const applyToPurchaseCost = () => {
    if (breakdown) {
      setForm(p => ({ ...p, purchase_cost_per_unit: breakdown.costPerUnit.toFixed(4) }));
    }
  };

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Bulk Purchase Breakdown</span>
        </div>
        <p className="text-xs text-muted-foreground">Enter bulk purchase details to calculate per-unit cost and speculative profit.</p>

        <div className="grid grid-cols-2 gap-3">
          <F label="Bulk Price" info="Total price you pay for the bulk purchase (e.g. $12 for the entire lot).">
            <Input type="number" value={form.bulk_purchase_price} onChange={e => setForm(p => ({ ...p, bulk_purchase_price: e.target.value }))} placeholder="e.g. 12.00" />
          </F>
          <F label="Purchase Currency" info="Currency you're paying your supplier in for this bulk purchase.">
            <CurrencySelect value={form.bulk_purchase_currency} onValueChange={v => setForm(p => ({ ...p, bulk_purchase_currency: v }))} />
          </F>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <F label="Bulk Quantity" info="Total amount you're buying in bulk (e.g. 50 kg).">
            <Input type="number" value={form.bulk_quantity} onChange={e => setForm(p => ({ ...p, bulk_quantity: e.target.value }))} placeholder="e.g. 50" />
          </F>
          <F label="Bulk Unit" info="The measurement unit for the bulk quantity.">
            <Select value={form.bulk_quantity_unit} onValueChange={v => setForm(p => ({ ...p, bulk_quantity_unit: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Gram (g)</SelectItem>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="lb">Pound (lb)</SelectItem>
                <SelectItem value="oz">Ounce (oz)</SelectItem>
                <SelectItem value="ton">Metric Ton</SelectItem>
                <SelectItem value="ml">Millilitre (ml)</SelectItem>
                <SelectItem value="L">Litre (L)</SelectItem>
                <SelectItem value="gal">Gallon (gal)</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </div>

        <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
          Selling unit: <strong>{form.weight_per_unit || '—'} {form.unit_of_measure}</strong> per unit @ <strong>{form.sale_currency} {form.unit_price || '—'}</strong> each
        </div>

        {breakdown && (
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yield</span>
                <span className="font-semibold text-foreground">{breakdown.yield.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost/unit</span>
                <span className="font-semibold text-foreground">{form.bulk_purchase_currency} {breakdown.costPerUnit.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-semibold text-foreground">{form.sale_currency} {breakdown.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Profit</span>
                <span className={`font-bold ${breakdown.grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                  {breakdown.grossProfit >= 0 ? '+' : ''}{breakdown.grossProfit.toFixed(2)}
                </span>
              </div>
            </div>
            <div className={`text-center py-2 rounded-md text-sm font-bold ${breakdown.marginPct >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
              Speculative Margin: {breakdown.marginPct.toFixed(1)}%
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={applyToPurchaseCost}>
              Apply {form.bulk_purchase_currency} {breakdown.costPerUnit.toFixed(4)} as Purchase Cost per Unit
            </Button>
          </div>
        )}

        {!breakdown && (form.bulk_purchase_price || form.bulk_quantity) && (
          <p className="text-xs text-muted-foreground/70 italic">
            Fill in bulk price, bulk quantity, and set weight per unit + selling price on the Basic tab to see breakdown.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MarginPreview({ form }: { form: ProductFormData }) {
  const sell = Number(form.unit_price) || 0;
  const costs = [form.purchase_cost_per_unit, form.shipping_cost_per_unit, form.customs_duty_per_unit,
    form.insurance_cost_per_unit, form.handling_fee_per_unit, form.packaging_cost_per_unit, form.inspection_cost_per_unit]
    .reduce((s, v) => s + (Number(v) || 0), 0);
  const profit = sell - costs;
  const margin = sell > 0 ? ((profit / sell) * 100) : 0;
  const minMargin = Number(form.min_margin_threshold) || 10;
  const belowMin = margin > 0 && margin < minMargin;
  const negative = margin < 0;

  if (sell <= 0) return null;

  return (
    <div className={`p-3 rounded-lg text-sm ${negative ? 'bg-destructive/10 text-destructive' : belowMin ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Live Margin Preview</span>
        <span className="font-bold">{margin.toFixed(1)}%</span>
      </div>
      <div className="flex items-center justify-between text-xs mt-0.5 opacity-80">
        <span>Profit: ${profit.toFixed(2)} / unit</span>
        <span>Landed: ${costs.toFixed(2)}</span>
      </div>
      {negative && <p className="text-xs mt-1 font-medium">⚠ Selling below cost!</p>}
      {belowMin && <p className="text-xs mt-1 font-medium">⚠ Below minimum margin threshold ({minMargin}%)</p>}
    </div>
  );
}

function AddPackagingTypeDialog({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (name: string) => Promise<void> }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim());
    setName('');
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-base">Add Packaging Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vacuum Sealed Bag" autoFocus />
        </div>
        <DialogFooter>
          <Button size="sm" onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExportProductForm({ form, setForm }: ExportProductFormProps) {
  const u = (field: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const { types: packagingTypes, addType } = useExportPackagingTypes();
  const [showAddPkg, setShowAddPkg] = useState(false);

  const handleCategoryChange = (catId: string, catSlug: string) => {
    setForm(p => ({ ...p, category: catSlug, category_id: catId, subcategory_id: '' }));
  };

  const handleSubcategoryChange = (subId: string) => {
    setForm(p => ({ ...p, subcategory_id: subId }));
  };

  const handleAddPackagingType = async (name: string) => {
    const newType = await addType(name);
    if (newType) {
      setForm(p => ({ ...p, packaging_type: newType.name }));
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="basic" className="text-[10px] px-1 py-1.5 flex items-center gap-0.5">
            <Package className="h-3 w-3" /> Basic
          </TabsTrigger>
          <TabsTrigger value="costs" className="text-[10px] px-1 py-1.5 flex items-center gap-0.5">
            <DollarSign className="h-3 w-3" /> Costs
          </TabsTrigger>
          <TabsTrigger value="protection" className="text-[10px] px-1 py-1.5 flex items-center gap-0.5">
            <Lock className="h-3 w-3" /> Protect
          </TabsTrigger>
          <TabsTrigger value="supplier" className="text-[10px] px-1 py-1.5 flex items-center gap-0.5">
            <Truck className="h-3 w-3" /> Supply
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-[10px] px-1 py-1.5 flex items-center gap-0.5">
            <BarChart3 className="h-3 w-3" /> Specs
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-[10px] px-1 py-1.5 flex items-center gap-0.5">
            <Shield className="h-3 w-3" /> Comply
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-3 mt-3">
          <F label="Product Name *" info="The commercial name shown to buyers in quotes and catalogs.">
            <Input value={form.name} onChange={u('name')} placeholder="e.g. Sea Salt Fine Grade" />
          </F>
          <ExportCategoryPicker
            categoryId={form.category_id}
            subcategoryId={form.subcategory_id}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
          />
          <div className="grid grid-cols-2 gap-3">
            <F label="SKU" info="Your internal stock-keeping unit code for inventory tracking.">
              <Input value={form.sku} onChange={u('sku')} placeholder="SALT-FG-001" />
            </F>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F label="Selling Price" info="The price per unit you charge buyers — used to calculate margin.">
              <Input type="number" value={form.unit_price} onChange={u('unit_price')} placeholder="0.00" />
            </F>
            <F label={`Weight per Unit${form.unit_of_measure ? ` (${UNIT_MAP[form.unit_of_measure] || form.unit_of_measure})` : ''}`} info="Net weight of one sellable unit — drives shipping cost estimates.">
              <Input type="number" value={form.weight_per_unit} onChange={u('weight_per_unit')} placeholder={form.unit_of_measure ? `e.g. 25 ${form.unit_of_measure}` : 'e.g. 25'} />
            </F>
            <F label="Unit of Measure" info="The measurement unit for weight/volume — updates the Weight per Unit label automatically.">
              <Select value={form.unit_of_measure} onValueChange={v => setForm(p => ({ ...p, unit_of_measure: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="lb">Pound (lb)</SelectItem>
                  <SelectItem value="oz">Ounce (oz)</SelectItem>
                  <SelectItem value="ton">Metric Ton (ton)</SelectItem>
                  <SelectItem value="ml">Millilitre (ml)</SelectItem>
                  <SelectItem value="L">Litre (L)</SelectItem>
                  <SelectItem value="gal">Gallon (gal)</SelectItem>
                  <SelectItem value="bag">Bag</SelectItem>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="unit">Unit</SelectItem>
                  <SelectItem value="pc">Piece (pc)</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="bbl">Barrel (bbl)</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Sale Currency" info="The currency you sell and quote this product in to your buyers.">
              <CurrencySelect value={form.sale_currency} onValueChange={v => setForm(p => ({ ...p, sale_currency: v }))} />
            </F>
          </div>

          <F label="Packaging Type" info="How the product is physically packaged for shipping (e.g. sealed bag, wooden crate). Affects freight and customs declarations.">
            <div className="flex gap-2">
              <Select value={form.packaging_type} onValueChange={v => setForm(p => ({ ...p, packaging_type: v }))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select packaging..." /></SelectTrigger>
                <SelectContent>
                  {packagingTypes.map(pt => (
                    <SelectItem key={pt.id} value={pt.name}>{pt.name}</SelectItem>
                  ))}
                  {packagingTypes.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No types yet — add one</div>
                  )}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" className="shrink-0 h-10 w-10" onClick={() => setShowAddPkg(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="HS Code" info="Harmonized System code used by customs worldwide to classify goods and determine import duties.">
              <Input value={form.hs_code} onChange={u('hs_code')} placeholder="2501.00" />
            </F>
            <F label="Country of Origin" info="Where the product was manufactured or harvested — required on all export documentation.">
              <Input value={form.country_of_origin} onChange={u('country_of_origin')} placeholder="Haiti" />
            </F>
          </div>
          <F label="Description" info="Detailed product description used in commercial invoices and buyer catalogs.">
            <Textarea value={form.description} onChange={u('description')} rows={2} placeholder="Product details..." />
          </F>
        </TabsContent>

        <TabsContent value="costs" className="space-y-3 mt-3">
          <MarginPreview form={form} />

          <BulkBreakdownCalculator form={form} setForm={setForm} />

          <p className="text-xs text-muted-foreground">All costs are per unit. Landed cost and margin are auto-calculated.</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Purchase Cost" info="What you pay your supplier per unit — the base of your landed cost calculation.">
              <Input type="number" value={form.purchase_cost_per_unit} onChange={u('purchase_cost_per_unit')} placeholder="0.00" />
            </F>
            <F label="Shipping Cost" info="Freight cost per unit to move the product from origin to port/destination.">
              <Input type="number" value={form.shipping_cost_per_unit} onChange={u('shipping_cost_per_unit')} placeholder="0.00" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Customs Duty (per unit)" info="Import tax per unit charged by the destination country based on HS code.">
              <Input type="number" value={form.customs_duty_per_unit} onChange={u('customs_duty_per_unit')} placeholder="0.00" />
            </F>
            <F label="Duty Rate %" info="The percentage rate applied to the product value for customs duty calculation.">
              <Input type="number" value={form.customs_duty_rate} onChange={u('customs_duty_rate')} placeholder="0" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Insurance Cost" info="Cargo insurance cost per unit — covers loss or damage during transit.">
              <Input type="number" value={form.insurance_cost_per_unit} onChange={u('insurance_cost_per_unit')} placeholder="0.00" />
            </F>
            <F label="Handling Fee" info="Port handling, loading, and unloading charges per unit.">
              <Input type="number" value={form.handling_fee_per_unit} onChange={u('handling_fee_per_unit')} placeholder="0.00" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Packaging Cost" info="Cost of packaging materials and labor per unit (bags, labels, sealing).">
              <Input type="number" value={form.packaging_cost_per_unit} onChange={u('packaging_cost_per_unit')} placeholder="0.00" />
            </F>
            <F label="Inspection Cost" info="Third-party quality inspection or lab testing fees per unit.">
              <Input type="number" value={form.inspection_cost_per_unit} onChange={u('inspection_cost_per_unit')} placeholder="0.00" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Purchase Currency" info="The currency used for all cost fields — what you pay your supplier in.">
              <CurrencySelect value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))} />
            </F>
            <F label="Incoterms" info="International Commercial Terms — defines who pays for shipping, insurance, and duties (e.g. FOB = buyer pays freight).">
              <Select value={form.preferred_incoterms} onValueChange={v => setForm(p => ({ ...p, preferred_incoterms: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CIF">CIF</SelectItem>
                  <SelectItem value="EXW">EXW</SelectItem>
                  <SelectItem value="CFR">CFR</SelectItem>
                  <SelectItem value="DDP">DDP</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>
        </TabsContent>

        <TabsContent value="protection" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground mb-2">Set guardrails to protect your margins and prevent underpricing.</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Min Margin Threshold %" info="System warns you if a quote would drop below this profit margin percentage.">
              <Input type="number" value={form.min_margin_threshold} onChange={u('min_margin_threshold')} placeholder="10" />
            </F>
            <F label="Max Discount Allowed %" info="Maximum discount a salesperson can offer before requiring manager approval.">
              <Input type="number" value={form.max_discount_pct} onChange={u('max_discount_pct')} placeholder="15" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Price Floor ($)" info="The absolute lowest price — system blocks any quote below this amount.">
              <Input type="number" value={form.price_floor} onChange={u('price_floor')} placeholder="0.00" />
            </F>
            <F label="Markup %" info="Default markup percentage applied on top of landed cost to set the selling price.">
              <Input type="number" value={form.markup_pct} onChange={u('markup_pct')} placeholder="0" />
            </F>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Lock Costs</p>
              <p className="text-xs text-muted-foreground">Prevent accidental cost changes</p>
            </div>
            <Switch checked={form.cost_locked} onCheckedChange={v => setForm(p => ({ ...p, cost_locked: v }))} />
          </div>

          <F label="Tariff Classification" info="HTS (Harmonized Tariff Schedule) code specific to the destination country for duty calculation.">
            <Input value={form.tariff_classification} onChange={u('tariff_classification')} placeholder="HTS classification code" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Anti-Dumping Duty %" info="Extra duty imposed when a product is exported at below fair market value — set by destination country.">
              <Input type="number" value={form.anti_dumping_duty_pct} onChange={u('anti_dumping_duty_pct')} placeholder="0" />
            </F>
            <F label="Countervailing Duty %" info="Duty imposed to offset subsidies provided by the exporting country's government.">
              <Input type="number" value={form.countervailing_duty_pct} onChange={u('countervailing_duty_pct')} placeholder="0" />
            </F>
          </div>
          <F label="Cost Review Notes" info="Internal notes about the last time costs were reviewed or updated — helps with audit trail.">
            <Textarea value={form.cost_review_notes} onChange={u('cost_review_notes')} rows={2} placeholder="Notes on last price review..." />
          </F>
        </TabsContent>

        <TabsContent value="supplier" className="space-y-3 mt-3">
          <F label="Supplier Name" info="The primary supplier or manufacturer you purchase this product from.">
            <Input value={form.supplier_name} onChange={u('supplier_name')} placeholder="Salt Co. Ltd" />
          </F>
          <F label="Contact Info" info="Supplier's phone number or email for placing orders and inquiries.">
            <Input value={form.supplier_contact} onChange={u('supplier_contact')} placeholder="Phone / email" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Supplier Country" info="Where your supplier is located — used for trade agreement and duty calculations.">
              <Input value={form.supplier_country} onChange={u('supplier_country')} placeholder="Haiti" />
            </F>
            <F label="Lead Time (days)" info="Number of days from placing an order to receiving the product — used for reorder planning.">
              <Input type="number" value={form.supplier_lead_time_days} onChange={u('supplier_lead_time_days')} placeholder="14" />
            </F>
          </div>
          <F label="Minimum Order Qty" info="Smallest quantity the supplier will accept per order — affects pricing tiers.">
            <Input type="number" value={form.minimum_order_qty} onChange={u('minimum_order_qty')} placeholder="1" />
          </F>
          <F label="Target Markets (comma-separated)" info="Countries or regions you plan to sell this product to — used for compliance checks and duty lookups.">
            <Input value={form.target_markets} onChange={u('target_markets')} placeholder="USA, Canada, DR" />
          </F>
        </TabsContent>

        <TabsContent value="specs" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <F label="Grade" info="Product quality grade (e.g. Fine, Coarse, Industrial) — appears on certificates and spec sheets.">
              <Input value={form.grade} onChange={u('grade')} placeholder="Fine / Coarse / Industrial" />
            </F>
            <F label="Grain Size" info="Physical particle size range — important for food, mineral, and agricultural products.">
              <Input value={form.grain_size} onChange={u('grain_size')} placeholder="0.1-0.5mm" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Moisture Content %" info="Percentage of water in the product — affects quality, shelf life, and customs classification.">
              <Input type="number" value={form.moisture_content_pct} onChange={u('moisture_content_pct')} placeholder="2.5" />
            </F>
            <F label="Shelf Life (days)" info="How long the product remains usable from production date — required for food export documentation.">
              <Input type="number" value={form.shelf_life_days} onChange={u('shelf_life_days')} placeholder="365" />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Storage Temp" info="Required storage temperature range — printed on packaging labels and export documents.">
              <Input value={form.storage_temperature} onChange={u('storage_temperature')} placeholder="Ambient / 15-25°C" />
            </F>
          </div>
          <F label="Storage Requirements" info="Special handling or storage conditions (humidity control, ventilation, stacking limits).">
            <Textarea value={form.storage_requirements} onChange={u('storage_requirements')} rows={2} placeholder="Dry, ventilated area..." />
          </F>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-3 mt-3">
          <F label="Certifications (comma-separated)" info="Quality and safety certifications the product holds — shown to buyers and required by some markets.">
            <Input value={form.certifications} onChange={u('certifications')} placeholder="ISO 9001, HACCP, FDA" />
          </F>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Export License Required</p>
                  <p className="text-xs text-muted-foreground">Government export permit needed</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                    Some products require a government-issued export license before they can leave the country.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch checked={form.export_license_required} onCheckedChange={v => setForm(p => ({ ...p, export_license_required: v }))} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Phytosanitary Certificate</p>
                  <p className="text-xs text-muted-foreground">Plant health certification required</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                    Required for plant/food products — proves the goods are pest-free per IPPC standards. Most agricultural exports need this.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch checked={form.phytosanitary_required} onCheckedChange={v => setForm(p => ({ ...p, phytosanitary_required: v }))} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Fumigation Required</p>
                  <p className="text-xs text-muted-foreground">Pest treatment before shipping</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                    Fumigation treats goods for pests before shipment — required by many countries for wood packaging and agricultural products.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch checked={form.fumigation_required} onCheckedChange={v => setForm(p => ({ ...p, fumigation_required: v }))} />
            </div>
          </div>
          <F label="Regulatory Notes" info="Any additional compliance notes, restrictions, or special documentation requirements.">
            <Textarea value={form.regulatory_notes} onChange={u('regulatory_notes')} rows={2} placeholder="Additional compliance notes..." />
          </F>
        </TabsContent>
      </Tabs>

      <AddPackagingTypeDialog open={showAddPkg} onOpenChange={setShowAddPkg} onAdd={handleAddPackagingType} />
    </TooltipProvider>
  );
}

export type { ProductFormData };
