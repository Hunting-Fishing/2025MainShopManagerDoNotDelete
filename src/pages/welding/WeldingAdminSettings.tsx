import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWeldingSettings, previewNumber, WeldingSettings } from "@/contexts/WeldingSettingsContext";
import { weldingAdminLinks } from "@/components/welding/WeldingAdminLayout";
import WeldingAdminLayout from "@/components/welding/WeldingAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const WeldingAdminSettings = () => {
  const { settings, loading, reload } = useWeldingSettings();
  const [form, setForm] = useState<Partial<WeldingSettings>>({});

  useEffect(() => { if (!loading) setForm({ ...settings }); }, [loading, settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form };
      delete payload.id; delete payload.created_at; delete payload.updated_at;
      if (settings.id) {
        const { error } = await supabase.from("welding_company_settings" as any).update(payload).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("welding_company_settings" as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: async () => { await reload(); toast.success("Settings saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const toggleQuickLink = (label: string) => {
    const current = (form.mobile_quick_links || []) as string[];
    if (current.includes(label)) set("mobile_quick_links", current.filter((l) => l !== label));
    else if (current.length < 5) set("mobile_quick_links", [...current, label]);
    else toast.error("Max 5 quick links");
  };

  if (loading) return <WeldingAdminLayout><p className="text-muted-foreground text-center py-12">Loading settings...</p></WeldingAdminLayout>;

  const f = form as any;

  return (
    <WeldingAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Settings</h1>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save Settings"}</Button>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input value={f.company_name || ""} onChange={(e) => set("company_name", e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={f.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><Label>Email</Label><Input value={f.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Logo URL</Label><Input value={f.logo_url || ""} onChange={(e) => set("logo_url", e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Address</Label><Textarea value={f.address || ""} onChange={(e) => set("address", e.target.value)} rows={2} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Default Tax Rate (%)</Label><Input type="number" value={f.default_tax_rate ?? 0} onChange={(e) => set("default_tax_rate", Number(e.target.value))} /></div>
            <div><Label>Travel Rate ($/km)</Label><Input type="number" step="0.01" value={f.travel_rate_per_km ?? 0} onChange={(e) => set("travel_rate_per_km", Number(e.target.value))} /></div>
            <div><Label>Currency</Label><Select value={f.currency || "CAD"} onValueChange={(v) => set("currency", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CAD">CAD</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></div>
            <div><Label>Currency Symbol</Label><Input value={f.currency_symbol || "$"} onChange={(e) => set("currency_symbol", e.target.value)} /></div>
            <div><Label>Deposit Percentage (%)</Label><Input type="number" value={f.deposit_percentage ?? 25} onChange={(e) => set("deposit_percentage", Number(e.target.value))} /></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={f.require_deposit ?? false} onCheckedChange={(v) => set("require_deposit", v)} /><Label>Require Deposit</Label></div>
            <div className="sm:col-span-2"><Label>Default Invoice Terms</Label><Textarea value={f.default_invoice_terms || ""} onChange={(e) => set("default_invoice_terms", e.target.value)} rows={2} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Document Numbering</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><Label>Quote Prefix</Label><Input value={f.quote_prefix || ""} onChange={(e) => set("quote_prefix", e.target.value)} /></div>
              <div><Label>Invoice Prefix</Label><Input value={f.invoice_prefix || ""} onChange={(e) => set("invoice_prefix", e.target.value)} /></div>
              <div><Label>PO Prefix</Label><Input value={f.po_prefix || ""} onChange={(e) => set("po_prefix", e.target.value)} /></div>
              <div><Label>Zero Padding</Label><Input type="number" value={f.number_padding ?? 4} onChange={(e) => set("number_padding", Number(e.target.value))} /></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={f.include_year ?? false} onCheckedChange={(v) => set("include_year", v)} /><Label>Include Year</Label></div>
              {f.include_year && <Select value={f.year_format || "full"} onValueChange={(v) => set("year_format", v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">2024</SelectItem><SelectItem value="short">24</SelectItem></SelectContent></Select>}
            </div>
            <div className="bg-muted rounded-md p-3 text-sm space-y-1">
              <p><span className="font-medium">Next Quote:</span> {previewNumber(f.quote_prefix || "QUO-", f.quote_next_number || 1, f.number_padding || 4, f.include_year || false, f.year_format || "full")}</p>
              <p><span className="font-medium">Next Invoice:</span> {previewNumber(f.invoice_prefix || "INV-", f.invoice_next_number || 1, f.number_padding || 4, f.include_year || false, f.year_format || "full")}</p>
              <p><span className="font-medium">Next PO:</span> {previewNumber(f.po_prefix || "PO-", f.po_next_number || 1, f.number_padding || 4, f.include_year || false, f.year_format || "full")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mobile Quick Links</CardTitle><p className="text-sm text-muted-foreground">Select up to 5 links for the mobile bottom bar</p></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {weldingAdminLinks.filter(l => l.label !== "Overview").map((link) => (
                <label key={link.label} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                  <Checkbox checked={(f.mobile_quick_links || []).includes(link.label)} onCheckedChange={() => toggleQuickLink(link.label)} />
                  <link.icon className="h-4 w-4" /><span className="text-sm">{link.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2"><Switch checked={f.enable_email_notifications ?? false} onCheckedChange={(v) => set("enable_email_notifications", v)} /><Label>Email Notifications</Label></div>
            <div className="flex items-center gap-2"><Switch checked={f.enable_customer_portal ?? true} onCheckedChange={(v) => set("enable_customer_portal", v)} /><Label>Customer Portal</Label></div>
          </CardContent>
        </Card>
      </div>
    </WeldingAdminLayout>
  );
};

export default WeldingAdminSettings;
