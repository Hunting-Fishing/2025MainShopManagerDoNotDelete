import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  ClipboardCheck,
  FileText,
  Edit,
  Trash2,
  Eye,
  Copy,
  Loader2,
  Shield,
  GripVertical,
  Save,
  ArrowLeft,
  Camera,
  Video,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Settings2,
  Layers,
  Package,
  Bell,
  Link2,
} from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  useInspectionTemplates,
  useInspectionTemplate,
  useCreateInspectionTemplate,
  useDeleteInspectionTemplate,
  useDuplicateInspectionTemplate,
  useUpdateInspectionTemplate,
  useAddInspectionSection,
  useUpdateInspectionSection,
  useDeleteInspectionSection,
  useAddInspectionItem,
  useUpdateInspectionItem,
  useDeleteInspectionItem,
} from '@/hooks/useInspectionTemplates';
import type { InspectionFormTemplate, InspectionFormSection, InspectionItemType } from '@/types/inspectionTemplate';
import { ITEM_TYPE_LABELS } from '@/types/inspectionTemplate';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ── GYR Selector ──────────────────────────────────────────────
type GYRValue = 'green' | 'yellow' | 'red' | null;

function GYRSelector({ value, onChange }: { value: GYRValue; onChange: (v: GYRValue) => void }) {
  const options: { val: GYRValue; icon: React.ReactNode; label: string; cls: string }[] = [
    { val: 'green', icon: <CheckCircle2 className="h-5 w-5" />, label: 'Good', cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/25' },
    { val: 'yellow', icon: <AlertTriangle className="h-5 w-5" />, label: 'Fair', cls: 'bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/25' },
    { val: 'red', icon: <XCircle className="h-5 w-5" />, label: 'Poor', cls: 'bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/25' },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.val}
          type="button"
          onClick={() => onChange(value === opt.val ? null : opt.val)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            value === opt.val ? `${opt.cls} ring-2 ring-offset-1 ring-current` : 'border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Septic-specific field components for XD ────────────────────
const SEPTIC_XD_FIELDS = [
  { key: 'tank_inlet', name: 'Tank Inlet', type: 'gyr_status' as InspectionItemType, category: 'tank' },
  { key: 'tank_outlet', name: 'Tank Outlet', type: 'gyr_status' as InspectionItemType, category: 'tank' },
  { key: 'tank_baffles', name: 'Baffles', type: 'gyr_status' as InspectionItemType, category: 'tank' },
  { key: 'tank_risers', name: 'Risers & Lids', type: 'gyr_status' as InspectionItemType, category: 'tank' },
  { key: 'tank_structural', name: 'Structural Integrity', type: 'gyr_status' as InspectionItemType, category: 'tank' },
  { key: 'effluent_filter', name: 'Effluent Filter', type: 'gyr_status' as InspectionItemType, category: 'filter' },
  { key: 'distribution_box', name: 'Distribution Box', type: 'gyr_status' as InspectionItemType, category: 'distribution' },
  { key: 'drain_field', name: 'Drain Field', type: 'gyr_status' as InspectionItemType, category: 'drain_field' },
  { key: 'drain_field_ponding', name: 'Drain Field Ponding', type: 'checkbox' as InspectionItemType, category: 'drain_field' },
  { key: 'pump_chamber', name: 'Pump Chamber', type: 'gyr_status' as InspectionItemType, category: 'pump' },
  { key: 'pump_floats', name: 'Pump Floats', type: 'gyr_status' as InspectionItemType, category: 'pump' },
  { key: 'pump_alarm', name: 'Alarm System', type: 'gyr_status' as InspectionItemType, category: 'pump' },
  { key: 'sludge_depth', name: 'Sludge Depth', type: 'text' as InspectionItemType, category: 'measurement' },
  { key: 'scum_depth', name: 'Scum Depth', type: 'text' as InspectionItemType, category: 'measurement' },
  { key: 'liquid_level', name: 'Liquid Level', type: 'text' as InspectionItemType, category: 'measurement' },
  { key: 'groundwater_contamination', name: 'Groundwater Contamination', type: 'checkbox' as InspectionItemType, category: 'environmental' },
  { key: 'surface_ponding', name: 'Surface Water Ponding', type: 'checkbox' as InspectionItemType, category: 'environmental' },
  { key: 'odor_present', name: 'Odor Present', type: 'checkbox' as InspectionItemType, category: 'environmental' },
  { key: 'vegetation_stress', name: 'Vegetation Stress', type: 'gyr_status' as InspectionItemType, category: 'environmental' },
  { key: 'site_photos', name: 'Site Photos', type: 'photo' as InspectionItemType, category: 'documentation' },
  { key: 'condition_photos', name: 'Condition Photos', type: 'photo' as InspectionItemType, category: 'documentation' },
  { key: 'video_walkthrough', name: 'Video Walkthrough', type: 'video' as InspectionItemType, category: 'documentation' },
  { key: 'inspector_notes', name: 'Inspector Notes', type: 'notes' as InspectionItemType, category: 'documentation' },
  { key: 'corrective_actions', name: 'Corrective Actions Needed', type: 'notes' as InspectionItemType, category: 'documentation' },
];

const XD_CATEGORIES: Record<string, string> = {
  tank: 'Tank Components',
  filter: 'Filtration',
  distribution: 'Distribution',
  drain_field: 'Drain Field',
  pump: 'Pump System',
  measurement: 'Measurements',
  environmental: 'Environmental',
  documentation: 'Documentation',
};

// ── Main Page ──────────────────────────────────────────────────
export default function SepticInspections() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  // Fetch only septic templates
  const { data: allTemplates, isLoading: templatesLoading } = useInspectionTemplates();
  const templates = allTemplates?.filter(t => t.asset_type === 'septic_system') || [];

  const deleteTemplate = useDeleteInspectionTemplate();
  const duplicateTemplate = useDuplicateInspectionTemplate();

  // Fetch completed inspections from new records table
  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery({
    queryKey: ['septic-inspection-records', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('septic_inspection_records' as any)
        .select('*')
        .eq('shop_id', shopId)
        .order('inspection_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDuplicate = async (templateId: string) => {
    try {
      await duplicateTemplate.mutateAsync(templateId);
      toast({ title: 'Template duplicated' });
    } catch {
      toast({ title: 'Failed to duplicate', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplateId) return;
    try {
      await deleteTemplate.mutateAsync(deleteTemplateId);
      setDeleteTemplateId(null);
      toast({ title: 'Template deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  // If editing a template, show the builder
  if (editingTemplateId) {
    return (
      <div className="p-4 md:p-6">
        <SepticTemplateBuilder
          templateId={editingTemplateId}
          onClose={() => setEditingTemplateId(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-500" />
            Inspections & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">Create digital inspection forms, manage system types, and track inventory alerts</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800">
          <Plus className="h-4 w-4 mr-2" />
          New Inspection Form
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Form Templates</span>
            <span className="sm:hidden">Forms</span>
          </TabsTrigger>
          <TabsTrigger value="system-types" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">System Types</span>
            <span className="sm:hidden">Types</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Form Templates Tab ── */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {templatesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No inspection forms yet</p>
                <p className="text-muted-foreground mb-4">Create your first septic inspection form template</p>
                <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{template.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant={template.is_published ? 'default' : 'secondary'} className="ml-2 shrink-0">
                        {template.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>v{template.version}</span>
                      <span>•</span>
                      <span>{template.is_base_template ? 'Base Template' : 'Custom'}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setEditingTemplateId(template.id)} className="flex-1">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(template.id)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteTemplateId(template.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── System Types Tab ── */}
        <TabsContent value="system-types" className="mt-4">
          <SystemTypesManager />
        </TabsContent>

        {/* ── Inventory Alerts Tab ── */}
        <TabsContent value="alerts" className="mt-4">
          <InventoryAlertsManager />
        </TabsContent>

        {/* ── Completed Inspections Tab ── */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {inspectionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : inspections.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No completed inspections yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {inspections.map((insp: any) => (
                <Card key={insp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={insp.overall_condition === 'good' ? 'default' : insp.overall_condition === 'fair' ? 'secondary' : 'destructive'}>
                            {insp.overall_condition || 'Pending'}
                          </Badge>
                          <Badge variant="outline">{insp.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(insp.inspection_date), 'MMM d, yyyy')}
                        </p>
                        {insp.comments && (
                          <p className="text-xs text-muted-foreground truncate">{insp.comments}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <CreateSepticTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(id) => {
          setCreateDialogOpen(false);
          setEditingTemplateId(id);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inspection Form</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this inspection form template and all its sections. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── System Types Manager ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function SystemTypesManager() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch system types
  const { data: systemTypes = [], isLoading } = useQuery({
    queryKey: ['septic-system-types', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('septic_system_types' as any)
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  // Fetch templates for linking
  const { data: allTemplates } = useInspectionTemplates();
  const septicTemplates = allTemplates?.filter(t => t.asset_type === 'septic_system') || [];

  // Fetch products for each system type
  const { data: allProducts = [] } = useQuery({
    queryKey: ['septic-system-type-products', shopId],
    queryFn: async () => {
      if (!shopId || systemTypes.length === 0) return [];
      const typeIds = systemTypes.map((t: any) => t.id);
      const { data, error } = await supabase
        .from('septic_system_type_products' as any)
        .select('*')
        .in('system_type_id', typeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId && systemTypes.length > 0,
  });

  // Create system type
  const createMutation = useMutation({
    mutationFn: async (values: { name: string; description: string; inspection_template_id: string | null }) => {
      const { error } = await supabase
        .from('septic_system_types' as any)
        .insert({ ...values, shop_id: shopId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-system-types'] });
      toast({ title: 'System type created' });
      setCreateOpen(false);
    },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  });

  // Update system type
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name: string; description: string; inspection_template_id: string | null }) => {
      const { error } = await supabase
        .from('septic_system_types' as any)
        .update(values)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-system-types'] });
      toast({ title: 'System type updated' });
      setEditingType(null);
    },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  });

  // Delete system type
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('septic_system_types' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-system-types'] });
      toast({ title: 'System type deleted' });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Failed to delete', variant: 'destructive' }),
  });

  // Add required product
  const addProductMutation = useMutation({
    mutationFn: async (values: { system_type_id: string; product_name: string; product_category: string; quantity_needed: number }) => {
      const { error } = await supabase
        .from('septic_system_type_products' as any)
        .insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-system-type-products'] });
      toast({ title: 'Product added' });
    },
    onError: () => toast({ title: 'Failed to add product', variant: 'destructive' }),
  });

  // Remove product
  const removeProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('septic_system_type_products' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-system-type-products'] });
      toast({ title: 'Product removed' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Types</h3>
          <p className="text-sm text-muted-foreground">Define system types (e.g., Type 1 Gravity, Type 2 Pressure) with linked forms and required products</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add System Type
        </Button>
      </div>

      {systemTypes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No system types defined</p>
            <p className="text-muted-foreground mb-4">Create system types to auto-populate forms and required products for customer properties</p>
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create System Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {systemTypes.map((st: any) => {
            const typeProducts = allProducts.filter((p: any) => p.system_type_id === st.id);
            const linkedTemplate = septicTemplates.find(t => t.id === st.inspection_template_id);
            return (
              <SystemTypeCard
                key={st.id}
                systemType={st}
                products={typeProducts}
                linkedTemplateName={linkedTemplate?.name}
                templates={septicTemplates}
                onEdit={() => setEditingType(st)}
                onDelete={() => setDeleteId(st.id)}
                onAddProduct={(product) => addProductMutation.mutate({ system_type_id: st.id, ...product })}
                onRemoveProduct={(id) => removeProductMutation.mutate(id)}
              />
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <SystemTypeDialog
        open={createOpen || !!editingType}
        onOpenChange={(open) => {
          if (!open) { setCreateOpen(false); setEditingType(null); }
        }}
        systemType={editingType}
        templates={septicTemplates}
        onSave={(values) => {
          if (editingType) {
            updateMutation.mutate({ id: editingType.id, ...values });
          } else {
            createMutation.mutate(values);
          }
        }}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete System Type</AlertDialogTitle>
            <AlertDialogDescription>This will remove this system type and all its linked products. Properties using this type will need to be reassigned.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SystemTypeCard({
  systemType,
  products,
  linkedTemplateName,
  templates,
  onEdit,
  onDelete,
  onAddProduct,
  onRemoveProduct,
}: {
  systemType: any;
  products: any[];
  linkedTemplateName?: string;
  templates: any[];
  onEdit: () => void;
  onDelete: () => void;
  onAddProduct: (product: { product_name: string; product_category: string; quantity_needed: number }) => void;
  onRemoveProduct: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('filter');
  const [newProductQty, setNewProductQty] = useState(1);

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    onAddProduct({ product_name: newProductName.trim(), product_category: newProductCategory, quantity_needed: newProductQty });
    setNewProductName('');
    setNewProductQty(1);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{systemType.name}</CardTitle>
              <Badge variant={systemType.is_active ? 'default' : 'secondary'}>
                {systemType.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {systemType.description && (
              <p className="text-sm text-muted-foreground mt-1">{systemType.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {linkedTemplateName && (
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Form: {linkedTemplateName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {products.length} required product{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-sm">Required Products & Chemicals</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            {products.length > 0 && (
              <div className="space-y-2">
                {products.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{p.product_category}</Badge>
                      <span className="text-sm">{p.product_name}</span>
                      <span className="text-xs text-muted-foreground">×{p.quantity_needed}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveProduct(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Product Name</Label>
                <Input
                  placeholder="e.g., Effluent Filter 4-inch"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Category</Label>
                <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filter">Filter</SelectItem>
                    <SelectItem value="chemical">Chemical</SelectItem>
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="supply">Supply</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-16 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input type="number" min={1} value={newProductQty} onChange={(e) => setNewProductQty(Number(e.target.value))} className="h-9" />
              </div>
              <Button size="sm" className="h-9" onClick={handleAddProduct} disabled={!newProductName.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function SystemTypeDialog({
  open,
  onOpenChange,
  systemType,
  templates,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemType: any | null;
  templates: any[];
  onSave: (values: { name: string; description: string; inspection_template_id: string | null }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState<string>('none');

  React.useEffect(() => {
    if (systemType) {
      setName(systemType.name || '');
      setDescription(systemType.description || '');
      setTemplateId(systemType.inspection_template_id || 'none');
    } else {
      setName('');
      setDescription('');
      setTemplateId('none');
    }
  }, [systemType, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, inspection_template_id: templateId === 'none' ? null : templateId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{systemType ? 'Edit System Type' : 'Create System Type'}</DialogTitle>
            <DialogDescription>
              Define a septic system type. Link it to an inspection form template so it auto-populates when a property with this type has a service.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>System Type Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Type 1 - Gravity Flow" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this system type..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Linked Inspection Form</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger><SelectValue placeholder="Select form template" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked form</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">When a work order is created for a property with this system type, this form will auto-populate</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name || isPending}>
              {isPending ? 'Saving...' : systemType ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Inventory Alerts Manager ──────────────────────────────────
// ══════════════════════════════════════════════════════════════
function InventoryAlertsManager() {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['septic-inventory-alerts', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('septic_inventory_alerts' as any)
        .select('*')
        .eq('shop_id', shopId)
        .order('product_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  // Fetch upcoming scheduled services (next 14 days)
  const { data: upcomingServices = [] } = useQuery({
    queryKey: ['septic-upcoming-services', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const { data, error } = await supabase
        .from('septic_property_systems' as any)
        .select('*, septic_system_types!inner(name, id)')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .lte('next_service_date', futureDate.toISOString().split('T')[0])
        .gte('next_service_date', new Date().toISOString().split('T')[0])
        .order('next_service_date', { ascending: true });
      if (error) return [];
      return data || [];
    },
    enabled: !!shopId,
  });

  // Create alert
  const createMutation = useMutation({
    mutationFn: async (values: { product_name: string; reorder_point: number; reorder_quantity: number; advance_notice_days: number }) => {
      const { error } = await supabase
        .from('septic_inventory_alerts' as any)
        .insert({ ...values, shop_id: shopId, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-inventory-alerts'] });
      toast({ title: 'Alert created' });
      setCreateOpen(false);
    },
    onError: () => toast({ title: 'Failed to create', variant: 'destructive' }),
  });

  // Toggle alert
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('septic_inventory_alerts' as any)
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['septic-inventory-alerts'] }),
  });

  // Delete alert
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('septic_inventory_alerts' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['septic-inventory-alerts'] });
      toast({ title: 'Alert removed' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Service Alerts */}
      {upcomingServices.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Upcoming Services ({upcomingServices.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Properties with services due in the next 14 days — check inventory for required products</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingServices.map((svc: any) => (
                <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div>
                    <p className="text-sm font-medium">{svc.property_address || 'Unknown Property'}</p>
                    <p className="text-xs text-muted-foreground">
                      System: {(svc as any).septic_system_types?.name} • Due: {svc.next_service_date}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                    {Math.ceil((new Date(svc.next_service_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reorder Point Alerts */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reorder Point Alerts</h3>
          <p className="text-sm text-muted-foreground">Set low-stock thresholds for filters, chemicals, and service products</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No inventory alerts configured</p>
            <p className="text-muted-foreground mb-4">Set up reorder points to get notified when stock is low before upcoming services</p>
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Alert Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((alert: any) => (
            <Card key={alert.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{alert.product_name}</span>
                      <Badge variant={alert.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {alert.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reorder at ≤ {alert.reorder_point} units • Order {alert.reorder_quantity} • {alert.advance_notice_days} day notice
                    </p>
                    {alert.last_alert_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Last alert: {format(new Date(alert.last_alert_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: alert.id, is_active: v })}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(alert.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Alert Dialog */}
      <CreateAlertDialog open={createOpen} onOpenChange={setCreateOpen} onSave={(v) => createMutation.mutate(v)} isPending={createMutation.isPending} />
    </div>
  );
}

function CreateAlertDialog({
  open,
  onOpenChange,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: { product_name: string; reorder_point: number; reorder_quantity: number; advance_notice_days: number }) => void;
  isPending: boolean;
}) {
  const [productName, setProductName] = useState('');
  const [reorderPoint, setReorderPoint] = useState(5);
  const [reorderQty, setReorderQty] = useState(10);
  const [noticeDays, setNoticeDays] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ product_name: productName, reorder_point: reorderPoint, reorder_quantity: reorderQty, advance_notice_days: noticeDays });
    setProductName('');
    setReorderPoint(5);
    setReorderQty(10);
    setNoticeDays(7);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Inventory Alert</DialogTitle>
            <DialogDescription>Set a reorder point for a product. You'll be notified when stock is low or when upcoming services need this item.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product / Item Name</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., 4-inch Effluent Filter" required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Reorder At</Label>
                <Input type="number" min={0} value={reorderPoint} onChange={(e) => setReorderPoint(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Order Qty</Label>
                <Input type="number" min={1} value={reorderQty} onChange={(e) => setReorderQty(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Notice Days</Label>
                <Input type="number" min={1} value={noticeDays} onChange={(e) => setNoticeDays(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!productName || isPending}>
              {isPending ? 'Saving...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Create Septic Template Dialog ─────────────────────────────
// ══════════════════════════════════════════════════════════════
function CreateSepticTemplateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createTemplate = useCreateInspectionTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTemplate.mutateAsync({
      name,
      description,
      asset_type: 'septic_system',
      is_base_template: true,
      sections: [
        {
          title: 'System 1 - Primary Tank',
          description: 'Primary septic tank inspection points',
          display_order: 1,
          items: [
            { item_name: 'Tank Condition', item_key: 'sys1_tank_condition', item_type: 'gyr_status', display_order: 1 },
            { item_name: 'Inlet Baffle', item_key: 'sys1_inlet_baffle', item_type: 'gyr_status', display_order: 2 },
            { item_name: 'Outlet Baffle', item_key: 'sys1_outlet_baffle', item_type: 'gyr_status', display_order: 3 },
            { item_name: 'Condition Photos', item_key: 'sys1_photos', item_type: 'photo', display_order: 4 },
            { item_name: 'Notes', item_key: 'sys1_notes', item_type: 'notes', display_order: 5 },
          ],
        },
        {
          title: 'System 2 - Distribution',
          description: 'Distribution box and drain field inspection',
          display_order: 2,
          items: [
            { item_name: 'Distribution Box', item_key: 'sys2_dist_box', item_type: 'gyr_status', display_order: 1 },
            { item_name: 'Drain Field', item_key: 'sys2_drain_field', item_type: 'gyr_status', display_order: 2 },
            { item_name: 'Surface Ponding', item_key: 'sys2_ponding', item_type: 'checkbox', display_order: 3 },
            { item_name: 'Photos', item_key: 'sys2_photos', item_type: 'photo', display_order: 4 },
            { item_name: 'Notes', item_key: 'sys2_notes', item_type: 'notes', display_order: 5 },
          ],
        },
        {
          title: 'System 3 - Pump & Alarm',
          description: 'Pump chamber, floats, and alarm system',
          display_order: 3,
          items: [
            { item_name: 'Pump Chamber', item_key: 'sys3_pump_chamber', item_type: 'gyr_status', display_order: 1 },
            { item_name: 'Float Switches', item_key: 'sys3_floats', item_type: 'gyr_status', display_order: 2 },
            { item_name: 'Alarm System', item_key: 'sys3_alarm', item_type: 'gyr_status', display_order: 3 },
            { item_name: 'Video Documentation', item_key: 'sys3_video', item_type: 'video', display_order: 4 },
            { item_name: 'Notes', item_key: 'sys3_notes', item_type: 'notes', display_order: 5 },
          ],
        },
      ],
    });
    if (result) {
      onCreated(result.id);
      setName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Septic Inspection Form</DialogTitle>
            <DialogDescription>
              Create a new digital inspection form. It will start with System 1, 2, 3 sections pre-configured.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Form Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Residential Septic Inspection"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the scope of this inspection form..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name || createTemplate.isPending}>
              {createTemplate.isPending ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// ── Septic Template Builder with System Tabs + XD Tab ─────────
// ══════════════════════════════════════════════════════════════
function SepticTemplateBuilder({ templateId, onClose }: { templateId: string; onClose: () => void }) {
  const { data: template, isLoading } = useInspectionTemplate(templateId);
  const updateTemplate = useUpdateInspectionTemplate();
  const addSection = useAddInspectionSection();
  const updateSection = useUpdateInspectionSection();
  const deleteSection = useDeleteInspectionSection();
  const addItem = useAddInspectionItem();
  const updateItem = useUpdateInspectionItem();
  const deleteItem = useDeleteInspectionItem();
  const { toast } = useToast();

  const [activeSystemTab, setActiveSystemTab] = useState('system-0');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  const [deleteItemState, setDeleteItemState] = useState<{ itemId: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Template not found</p>
        <Button variant="outline" onClick={onClose} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const sections = template.sections || [];

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateTemplate.mutateAsync({ templateId, updates: { name: tempName.trim() } });
    }
    setEditingName(false);
  };

  const handleTogglePublish = async () => {
    await updateTemplate.mutateAsync({
      templateId,
      updates: {
        is_published: !template.is_published,
        version: template.is_published ? template.version : template.version + 1,
      },
    });
  };

  const handleAddSection = async () => {
    const displayOrder = sections.length + 1;
    await addSection.mutateAsync({
      templateId,
      title: `System ${displayOrder}`,
      displayOrder,
    });
  };

  const handleDeleteSection = async () => {
    if (deleteSectionId) {
      await deleteSection.mutateAsync({ sectionId: deleteSectionId, templateId });
      setDeleteSectionId(null);
      setActiveSystemTab('system-0');
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemState) {
      await deleteItem.mutateAsync({ itemId: deleteItemState.itemId, templateId });
      setDeleteItemState(null);
    }
  };

  const handleAddXDField = async (field: typeof SEPTIC_XD_FIELDS[0], sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const displayOrder = (section?.items?.length || 0) + 1;
    
    const existingKeys = section?.items?.map(i => i.item_key) || [];
    if (existingKeys.includes(field.key)) {
      toast({ title: 'Field already exists in this section', variant: 'destructive' });
      return;
    }

    await addItem.mutateAsync({
      sectionId,
      templateId,
      item: {
        item_name: field.name,
        item_key: `${field.key}_${Date.now()}`,
        item_type: field.type,
        display_order: displayOrder,
        is_required: false,
        component_category: field.category,
      },
    });
    toast({ title: `Added "${field.name}"` });
  };

  const handleAddCustomItem = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const displayOrder = (section?.items?.length || 0) + 1;
    await addItem.mutateAsync({
      sectionId,
      templateId,
      item: {
        item_name: 'New Field',
        item_key: `custom_${Date.now()}`,
        item_type: 'gyr_status',
        display_order: displayOrder,
        is_required: false,
      },
    });
  };

  const systemTabs = sections.map((s, i) => ({
    key: `system-${i}`,
    label: s.title,
    section: s,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-xl font-bold" autoFocus />
                <Button size="sm" onClick={handleSaveName}><Save className="h-4 w-4" /></Button>
              </div>
            ) : (
              <h2
                className="text-2xl font-bold cursor-pointer hover:text-primary"
                onClick={() => { setTempName(template.name); setEditingName(true); }}
              >
                {template.name}
              </h2>
            )}
            <p className="text-sm text-muted-foreground">
              Septic Inspection Form • v{template.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="publish-toggle" className="text-sm">
            {template.is_published ? 'Published' : 'Draft'}
          </Label>
          <Switch id="publish-toggle" checked={template.is_published} onCheckedChange={handleTogglePublish} />
        </div>
      </div>

      {/* System Tabs + XD Tab */}
      <Tabs value={activeSystemTab} onValueChange={setActiveSystemTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {systemTabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-xs md:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="xd" className="text-xs md:text-sm flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            XD
          </TabsTrigger>
        </TabsList>

        {systemTabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4 space-y-4">
            <SectionEditor
              section={tab.section}
              templateId={templateId}
              onUpdateSection={updateSection}
              onDeleteSection={() => setDeleteSectionId(tab.section.id)}
              onAddItem={() => handleAddCustomItem(tab.section.id)}
              onUpdateItem={updateItem}
              onDeleteItem={(itemId) => setDeleteItemState({ itemId })}
            />
          </TabsContent>
        ))}

        <TabsContent value="xd" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Add Fields to Sections
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select pre-built septic inspection fields to add to any system section
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Add a section first before adding fields</p>
              ) : (
                <XDFieldPicker
                  sections={sections}
                  onAddField={handleAddXDField}
                  isPending={addItem.isPending}
                />
              )}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full border-dashed" onClick={handleAddSection} disabled={addSection.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Add New System Section
          </Button>
        </TabsContent>
      </Tabs>

      {sections.length === 0 && activeSystemTab !== 'xd' && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No sections yet. Click XD tab or add a section to start.</p>
            <Button variant="outline" onClick={handleAddSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>This will delete the section and all its fields. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteItemState} onOpenChange={() => setDeleteItemState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this inspection field?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── XD Field Picker ────────────────────────────────────────────
function XDFieldPicker({
  sections,
  onAddField,
  isPending,
}: {
  sections: InspectionFormSection[];
  onAddField: (field: typeof SEPTIC_XD_FIELDS[0], sectionId: string) => void;
  isPending: boolean;
}) {
  const [targetSectionId, setTargetSectionId] = useState(sections[0]?.id || '');

  const grouped = SEPTIC_XD_FIELDS.reduce((acc, field) => {
    const cat = field.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(field);
    return acc;
  }, {} as Record<string, typeof SEPTIC_XD_FIELDS>);

  const getTypeIcon = (type: InspectionItemType) => {
    switch (type) {
      case 'gyr_status': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'photo': return <Camera className="h-3.5 w-3.5" />;
      case 'video': return <Video className="h-3.5 w-3.5" />;
      case 'notes': return <MessageSquare className="h-3.5 w-3.5" />;
      case 'checkbox': return <CheckCircle2 className="h-3.5 w-3.5" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Add fields to section:</Label>
        <Select value={targetSectionId} onValueChange={setTargetSectionId}>
          <SelectTrigger>
            <SelectValue placeholder="Select target section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {Object.entries(grouped).map(([category, fields]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold mb-2">{XD_CATEGORIES[category] || category}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fields.map((field) => (
              <Button
                key={field.key}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2 px-3"
                disabled={isPending || !targetSectionId}
                onClick={() => onAddField(field, targetSectionId)}
              >
                <span className="mr-2 text-muted-foreground">{getTypeIcon(field.type)}</span>
                <span className="text-left flex-1">
                  <span className="block text-xs font-medium">{field.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{ITEM_TYPE_LABELS[field.type]}</span>
                </span>
                <Plus className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section Editor ─────────────────────────────────────────────
function SectionEditor({
  section,
  templateId,
  onUpdateSection,
  onDeleteSection,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: {
  section: InspectionFormSection;
  templateId: string;
  onUpdateSection: ReturnType<typeof useUpdateInspectionSection>;
  onDeleteSection: () => void;
  onAddItem: () => void;
  onUpdateItem: ReturnType<typeof useUpdateInspectionItem>;
  onDeleteItem: (itemId: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);
  const [tempDesc, setTempDesc] = useState(section.description || '');

  const handleSaveTitle = async () => {
    if (tempTitle.trim()) {
      await onUpdateSection.mutateAsync({
        sectionId: section.id,
        templateId,
        updates: { title: tempTitle.trim(), description: tempDesc.trim() || undefined },
      });
    }
    setEditingTitle(false);
  };

  const getFieldIcon = (type: InspectionItemType) => {
    switch (type) {
      case 'gyr_status': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'photo': return <Camera className="h-4 w-4 text-blue-500" />;
      case 'video': return <Video className="h-4 w-4 text-purple-500" />;
      case 'notes': return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case 'checkbox': return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          {editingTitle ? (
            <div className="flex-1 space-y-2 mr-4">
              <Input value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} placeholder="Section title" autoFocus />
              <Textarea value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} placeholder="Section description (optional)" rows={2} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveTitle}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingTitle(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 cursor-pointer" onClick={() => { setTempTitle(section.title); setTempDesc(section.description || ''); setEditingTitle(true); }}>
              <CardTitle className="text-lg hover:text-primary">{section.title}</CardTitle>
              {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onDeleteSection} className="text-destructive shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(section.items || []).map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            templateId={templateId}
            onUpdate={onUpdateItem}
            onDelete={() => onDeleteItem(item.id)}
            icon={getFieldIcon(item.item_type)}
          />
        ))}

        {(!section.items || section.items.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">No fields yet. Use the XD tab or add manually below.</p>
        )}

        <Button variant="outline" size="sm" className="w-full border-dashed" onClick={onAddItem}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Field
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Item Row ───────────────────────────────────────────────────
function ItemRow({
  item,
  templateId,
  onUpdate,
  onDelete,
  icon,
}: {
  item: any;
  templateId: string;
  onUpdate: ReturnType<typeof useUpdateInspectionItem>;
  onDelete: () => void;
  icon: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [itemName, setItemName] = useState(item.item_name);
  const [itemType, setItemType] = useState<InspectionItemType>(item.item_type);
  const [isRequired, setIsRequired] = useState(item.is_required || false);
  const [description, setDescription] = useState(item.description || '');
  const [dirty, setDirty] = useState(false);

  const handleSave = async () => {
    await onUpdate.mutateAsync({
      itemId: item.id,
      templateId,
      updates: {
        item_name: itemName,
        item_type: itemType,
        is_required: isRequired,
        description: description || undefined,
      },
    });
    setDirty(false);
  };

  return (
    <div className="border rounded-lg">
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        {icon}
        <span className="flex-1 text-sm font-medium truncate">{item.item_name}</span>
        <Badge variant="outline" className="text-[10px] shrink-0">{ITEM_TYPE_LABELS[item.item_type as InspectionItemType] || item.item_type}</Badge>
        {item.is_required && <Badge variant="secondary" className="text-[10px] shrink-0">Required</Badge>}
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Field Name</Label>
              <Input value={itemName} onChange={(e) => { setItemName(e.target.value); setDirty(true); }} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Field Type</Label>
              <Select value={itemType} onValueChange={(v) => { setItemType(v as InspectionItemType); setDirty(true); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ITEM_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => { setDescription(e.target.value); setDirty(true); }} rows={2} placeholder="Optional help text..." />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={isRequired} onCheckedChange={(v) => { setIsRequired(v); setDirty(true); }} />
              <Label className="text-xs">Required</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
              {dirty && (
                <Button size="sm" onClick={handleSave} disabled={onUpdate.isPending}>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
