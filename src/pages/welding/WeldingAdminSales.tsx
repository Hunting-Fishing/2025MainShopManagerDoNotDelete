import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/useShopId";
import WeldingAdminLayout from "@/components/welding/WeldingAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Handshake, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = { open: "bg-blue-100 text-blue-800", contacted: "bg-amber-100 text-amber-800", quoted: "bg-purple-100 text-purple-800", won: "bg-green-100 text-green-800", lost: "bg-red-100 text-red-800" };
const emptyActivity = { activity_type: "general", customer_name: "", customer_email: "", customer_phone: "", notes: "", follow_up_date: "", status: "open", customer_id: null, quote_id: null };

const WeldingAdminSales = () => {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyActivity });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["welding-sales", shopId],
    queryFn: async () => {
      if (!shopId) return [] as any[];
      const { data, error } = await supabase.from("welding_sales_activities" as any).select("*").eq("shop_id", shopId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!shopId,
  });

  const saveMutation = useMutation({
    mutationFn: async (d: any) => {
      const payload = { shop_id: shopId, activity_type: d.activity_type, customer_name: d.customer_name, customer_email: d.customer_email || null, customer_phone: d.customer_phone || null, notes: d.notes || null, follow_up_date: d.follow_up_date || null, status: d.status, customer_id: d.customer_id || null, quote_id: d.quote_id || null };
      if (editing) { const { error } = await supabase.from("welding_sales_activities" as any).update(payload).eq("id", editing.id); if (error) throw error; }
      else { const { error } = await supabase.from("welding_sales_activities" as any).insert(payload); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["welding-sales"] }); toast.success(editing ? "Updated" : "Added"); closeDialog(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("welding_sales_activities" as any).delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["welding-sales"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (a: any) => { setEditing(a); setForm({ ...emptyActivity, ...a }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm({ ...emptyActivity }); setOpen(true); };
  const closeDialog = () => { setOpen(false); setEditing(null); };

  const filtered = activities.filter((a: any) => {
    const matchSearch = !search || (a.customer_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <WeldingAdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Sales Pipeline</h1>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Activity</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="quoted">Quoted</SelectItem><SelectItem value="won">Won</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select>
      </div>
      {isLoading ? <p className="text-muted-foreground text-center py-12">Loading...</p> : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Handshake className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No sales activities</p></CardContent></Card>
      ) : (
        <div className="grid gap-3">{filtered.map((a: any) => {
          const isFollowUp = a.follow_up_date && new Date(a.follow_up_date) <= new Date() && a.status !== "won" && a.status !== "lost";
          return (
            <Card key={a.id} className={`cursor-pointer hover:shadow-md transition-shadow ${isFollowUp ? "border-amber-400" : ""}`} onClick={() => openEdit(a)}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold">{a.customer_name || "Unknown"}</span><Badge className={STATUS_COLORS[a.status] || "bg-muted"}>{a.status}</Badge><Badge variant="outline" className="text-xs">{a.activity_type}</Badge></div>
                  {a.notes && <p className="text-sm text-muted-foreground truncate mt-0.5">{a.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  {a.follow_up_date && <p className={`text-xs flex items-center gap-1 ${isFollowUp ? "text-amber-600 font-medium" : "text-muted-foreground"}`}><CalendarDays className="h-3 w-3" />{new Date(a.follow_up_date).toLocaleDateString()}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>);
        })}</div>
      )}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Activity" : "New Sales Activity"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>Customer Name</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
              <div><Label>Type</Label><Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="inquiry">Inquiry</SelectItem><SelectItem value="referral">Referral</SelectItem><SelectItem value="follow_up">Follow-up</SelectItem></SelectContent></Select></div>
              <div><Label>Email</Label><Input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="quoted">Quoted</SelectItem><SelectItem value="won">Won</SelectItem><SelectItem value="lost">Lost</SelectItem></SelectContent></Select></div>
              <div><Label>Follow-up Date</Label><Input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
            <div className="flex items-center justify-between pt-2 border-t">
              {editing && <Button type="button" variant="destructive" size="sm" onClick={() => { deleteMutation.mutate(editing.id); closeDialog(); }}>Delete</Button>}
              <div className="ml-auto flex gap-2"><Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save"}</Button></div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </WeldingAdminLayout>
  );
};

export default WeldingAdminSales;
