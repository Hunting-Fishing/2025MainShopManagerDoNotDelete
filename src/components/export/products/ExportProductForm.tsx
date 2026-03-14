import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, Truck, Shield, BarChart3 } from 'lucide-react';

interface ProductFormData {
  name: string;
  category: string;
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
}

interface ExportProductFormProps {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export const getEmptyForm = (): ProductFormData => ({
  name: '', category: 'salt', sku: '', description: '', unit_of_measure: 'kg',
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
});

export const formToInsert = (form: ProductFormData, shopId: string) => ({
  shop_id: shopId,
  name: form.name,
  category: form.category,
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
});

export const productToForm = (p: any): ProductFormData => ({
  name: p.name || '',
  category: p.category || 'salt',
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
});

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export function ExportProductForm({ form, setForm }: ExportProductFormProps) {
  const u = (field: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-auto">
        <TabsTrigger value="basic" className="text-xs px-2 py-1.5 flex items-center gap-1">
          <Package className="h-3 w-3" /> Basic
        </TabsTrigger>
        <TabsTrigger value="costs" className="text-xs px-2 py-1.5 flex items-center gap-1">
          <DollarSign className="h-3 w-3" /> Costs
        </TabsTrigger>
        <TabsTrigger value="supplier" className="text-xs px-2 py-1.5 flex items-center gap-1">
          <Truck className="h-3 w-3" /> Supplier
        </TabsTrigger>
        <TabsTrigger value="specs" className="text-xs px-2 py-1.5 flex items-center gap-1">
          <BarChart3 className="h-3 w-3" /> Specs
        </TabsTrigger>
        <TabsTrigger value="compliance" className="text-xs px-2 py-1.5 flex items-center gap-1">
          <Shield className="h-3 w-3" /> Compliance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-3 mt-3">
        <F label="Product Name *"><Input value={form.name} onChange={u('name')} placeholder="e.g. Sea Salt Fine Grade" /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Category">
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="salt">Salt</SelectItem>
                <SelectItem value="dehydrated_food">Dehydrated Food</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </F>
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
        <p className="text-xs text-muted-foreground mb-2">All costs are per unit. Landed cost and margin are auto-calculated.</p>
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
