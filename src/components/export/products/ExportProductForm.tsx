import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, Truck, Shield, BarChart3, Lock } from 'lucide-react';
import { ExportCategoryPicker } from './ExportCategoryPicker';

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
  // Profit protection
  min_margin_threshold: string;
  max_discount_pct: string;
  cost_locked: boolean;
  price_floor: string;
  markup_pct: string;
  cost_review_notes: string;
  tariff_classification: string;
  anti_dumping_duty_pct: string;
  countervailing_duty_pct: string;
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
  target_markets: '', preferred_incoterms: 'FOB', currency: 'USD',
  min_margin_threshold: '10', max_discount_pct: '15', cost_locked: false,
  price_floor: '0', markup_pct: '0', cost_review_notes: '',
  tariff_classification: '', anti_dumping_duty_pct: '0', countervailing_duty_pct: '0',
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
  // Profit protection
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
  category: p.category || 'salt',
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
  min_margin_threshold: p.min_margin_threshold?.toString() || '10',
  max_discount_pct: p.max_discount_pct?.toString() || '15',
  cost_locked: p.cost_locked || false,
  price_floor: p.price_floor?.toString() || '0',
  markup_pct: p.markup_pct?.toString() || '0',
  cost_review_notes: p.cost_review_notes || '',
  tariff_classification: p.tariff_classification || '',
  anti_dumping_duty_pct: p.anti_dumping_duty_pct?.toString() || '0',
  countervailing_duty_pct: p.countervailing_duty_pct?.toString() || '0',
});

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

// Live margin preview
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

export function ExportProductForm({ form, setForm }: ExportProductFormProps) {
  const u = (field: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleCategoryChange = (catId: string, catSlug: string) => {
    setForm(p => ({ ...p, category: catSlug, category_id: catId, subcategory_id: '' }));
  };

  const handleSubcategoryChange = (subId: string) => {
    setForm(p => ({ ...p, subcategory_id: subId }));
  };

  return (
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
        <F label="Product Name *"><Input value={form.name} onChange={u('name')} placeholder="e.g. Sea Salt Fine Grade" /></F>
        <ExportCategoryPicker
          categoryId={form.category_id}
          subcategoryId={form.subcategory_id}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
        />
        <div className="grid grid-cols-2 gap-3">
          <F label="SKU"><Input value={form.sku} onChange={u('sku')} placeholder="SALT-FG-001" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Selling Price ($)"><Input type="number" value={form.unit_price} onChange={u('unit_price')} placeholder="0.00" /></F>
          <F label="Weight per Unit"><Input type="number" value={form.weight_per_unit} onChange={u('weight_per_unit')} placeholder="kg" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Unit of Measure">
            <Select value={form.unit_of_measure} onValueChange={v => setForm(p => ({ ...p, unit_of_measure: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="lb">Pound (lb)</SelectItem>
                <SelectItem value="ton">Metric Ton</SelectItem>
                <SelectItem value="bag">Bag</SelectItem>
                <SelectItem value="pallet">Pallet</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="unit">Unit</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Packaging Type"><Input value={form.packaging_type} onChange={u('packaging_type')} placeholder="25kg PP bags" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="HS Code"><Input value={form.hs_code} onChange={u('hs_code')} placeholder="2501.00" /></F>
          <F label="Country of Origin"><Input value={form.country_of_origin} onChange={u('country_of_origin')} placeholder="Haiti" /></F>
        </div>
        <F label="Description"><Textarea value={form.description} onChange={u('description')} rows={2} placeholder="Product details..." /></F>
      </TabsContent>

      <TabsContent value="costs" className="space-y-3 mt-3">
        <MarginPreview form={form} />
        <p className="text-xs text-muted-foreground">All costs are per unit. Landed cost and margin are auto-calculated.</p>
        <div className="grid grid-cols-2 gap-3">
          <F label="Purchase Cost"><Input type="number" value={form.purchase_cost_per_unit} onChange={u('purchase_cost_per_unit')} placeholder="0.00" /></F>
          <F label="Shipping Cost"><Input type="number" value={form.shipping_cost_per_unit} onChange={u('shipping_cost_per_unit')} placeholder="0.00" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Customs Duty (per unit)"><Input type="number" value={form.customs_duty_per_unit} onChange={u('customs_duty_per_unit')} placeholder="0.00" /></F>
          <F label="Duty Rate %"><Input type="number" value={form.customs_duty_rate} onChange={u('customs_duty_rate')} placeholder="0" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Insurance Cost"><Input type="number" value={form.insurance_cost_per_unit} onChange={u('insurance_cost_per_unit')} placeholder="0.00" /></F>
          <F label="Handling Fee"><Input type="number" value={form.handling_fee_per_unit} onChange={u('handling_fee_per_unit')} placeholder="0.00" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Packaging Cost"><Input type="number" value={form.packaging_cost_per_unit} onChange={u('packaging_cost_per_unit')} placeholder="0.00" /></F>
          <F label="Inspection Cost"><Input type="number" value={form.inspection_cost_per_unit} onChange={u('inspection_cost_per_unit')} placeholder="0.00" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Currency">
            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="HTG">HTG</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Incoterms">
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
          <F label="Min Margin Threshold %"><Input type="number" value={form.min_margin_threshold} onChange={u('min_margin_threshold')} placeholder="10" /></F>
          <F label="Max Discount Allowed %"><Input type="number" value={form.max_discount_pct} onChange={u('max_discount_pct')} placeholder="15" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Price Floor ($)"><Input type="number" value={form.price_floor} onChange={u('price_floor')} placeholder="0.00" /></F>
          <F label="Markup %"><Input type="number" value={form.markup_pct} onChange={u('markup_pct')} placeholder="0" /></F>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm font-medium text-foreground">Lock Costs</p>
            <p className="text-xs text-muted-foreground">Prevent accidental cost changes</p>
          </div>
          <Switch checked={form.cost_locked} onCheckedChange={v => setForm(p => ({ ...p, cost_locked: v }))} />
        </div>

        <F label="Tariff Classification"><Input value={form.tariff_classification} onChange={u('tariff_classification')} placeholder="HTS classification code" /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Anti-Dumping Duty %"><Input type="number" value={form.anti_dumping_duty_pct} onChange={u('anti_dumping_duty_pct')} placeholder="0" /></F>
          <F label="Countervailing Duty %"><Input type="number" value={form.countervailing_duty_pct} onChange={u('countervailing_duty_pct')} placeholder="0" /></F>
        </div>
        <F label="Cost Review Notes"><Textarea value={form.cost_review_notes} onChange={u('cost_review_notes')} rows={2} placeholder="Notes on last price review..." /></F>
      </TabsContent>

      <TabsContent value="supplier" className="space-y-3 mt-3">
        <F label="Supplier Name"><Input value={form.supplier_name} onChange={u('supplier_name')} placeholder="Salt Co. Ltd" /></F>
        <F label="Contact Info"><Input value={form.supplier_contact} onChange={u('supplier_contact')} placeholder="Phone / email" /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Supplier Country"><Input value={form.supplier_country} onChange={u('supplier_country')} placeholder="Haiti" /></F>
          <F label="Lead Time (days)"><Input type="number" value={form.supplier_lead_time_days} onChange={u('supplier_lead_time_days')} placeholder="14" /></F>
        </div>
        <F label="Minimum Order Qty"><Input type="number" value={form.minimum_order_qty} onChange={u('minimum_order_qty')} placeholder="1" /></F>
        <F label="Target Markets (comma-separated)"><Input value={form.target_markets} onChange={u('target_markets')} placeholder="USA, Canada, DR" /></F>
      </TabsContent>

      <TabsContent value="specs" className="space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <F label="Grade"><Input value={form.grade} onChange={u('grade')} placeholder="Fine / Coarse / Industrial" /></F>
          <F label="Grain Size"><Input value={form.grain_size} onChange={u('grain_size')} placeholder="0.1-0.5mm" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Moisture Content %"><Input type="number" value={form.moisture_content_pct} onChange={u('moisture_content_pct')} placeholder="2.5" /></F>
          <F label="Shelf Life (days)"><Input type="number" value={form.shelf_life_days} onChange={u('shelf_life_days')} placeholder="365" /></F>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Storage Temp"><Input value={form.storage_temperature} onChange={u('storage_temperature')} placeholder="Ambient / 15-25°C" /></F>
        </div>
        <F label="Storage Requirements"><Textarea value={form.storage_requirements} onChange={u('storage_requirements')} rows={2} placeholder="Dry, ventilated area..." /></F>
      </TabsContent>

      <TabsContent value="compliance" className="space-y-3 mt-3">
        <F label="Certifications (comma-separated)"><Input value={form.certifications} onChange={u('certifications')} placeholder="ISO 9001, HACCP, FDA" /></F>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Export License Required</p>
              <p className="text-xs text-muted-foreground">Government export permit needed</p>
            </div>
            <Switch checked={form.export_license_required} onCheckedChange={v => setForm(p => ({ ...p, export_license_required: v }))} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Phytosanitary Certificate</p>
              <p className="text-xs text-muted-foreground">Plant health certification required</p>
            </div>
            <Switch checked={form.phytosanitary_required} onCheckedChange={v => setForm(p => ({ ...p, phytosanitary_required: v }))} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Fumigation Required</p>
              <p className="text-xs text-muted-foreground">Pest treatment before shipping</p>
            </div>
            <Switch checked={form.fumigation_required} onCheckedChange={v => setForm(p => ({ ...p, fumigation_required: v }))} />
          </div>
        </div>
        <F label="Regulatory Notes"><Textarea value={form.regulatory_notes} onChange={u('regulatory_notes')} rows={2} placeholder="Additional compliance notes..." /></F>
      </TabsContent>
    </Tabs>
  );
}

export type { ProductFormData };
