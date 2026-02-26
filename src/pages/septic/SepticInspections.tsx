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

  // Fetch completed inspections
  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery({
    queryKey: ['septic-inspections', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('septic_inspections')
        .select('*, septic_tanks(tank_name, tank_type), customers:septic_tanks(customer_id)')
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
          <p className="text-muted-foreground mt-1">Create digital inspection forms, track compliance, and document system conditions</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800">
          <Plus className="h-4 w-4 mr-2" />
          New Inspection Form
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Form Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Completed ({inspections.length})
          </TabsTrigger>
        </TabsList>

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
                          <span className="font-semibold capitalize">{insp.inspection_type?.replace('_', ' ')}</span>
                          <Badge variant={insp.pass_fail === 'pass' ? 'default' : insp.pass_fail === 'fail' ? 'destructive' : 'secondary'}>
                            {insp.pass_fail || 'Pending'}
                          </Badge>
                          <Badge variant="outline" className={
                            insp.overall_condition === 'good' ? 'border-emerald-500/30 text-emerald-600' :
                            insp.overall_condition === 'fair' ? 'border-amber-500/30 text-amber-600' :
                            'border-red-500/30 text-red-600'
                          }>
                            {insp.overall_condition}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Inspector: {insp.inspector_name || 'Unknown'} • {format(new Date(insp.inspection_date), 'MMM d, yyyy')}
                        </p>
                        {insp.notes && (
                          <p className="text-xs text-muted-foreground truncate">{insp.notes}</p>
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

// ── Create Septic Template Dialog ──────────────────────────────
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

// ── Septic Template Builder with System Tabs + XD Tab ──────────
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
    
    // Check for duplicate keys
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

  // Build tab list: system sections + XD tab
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
          <div className="flex items-center gap-2">
            <Label htmlFor="publish-toggle" className="text-sm">
              {template.is_published ? 'Published' : 'Draft'}
            </Label>
            <Switch id="publish-toggle" checked={template.is_published} onCheckedChange={handleTogglePublish} />
          </div>
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

        {/* System Section Tabs */}
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

        {/* XD Tab - Field Picker */}
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
                <>
                  {/* Target section selector */}
                  <XDFieldPicker
                    sections={sections}
                    onAddField={handleAddXDField}
                    isPending={addItem.isPending}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full border-dashed" onClick={handleAddSection} disabled={addSection.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Add New System Section
          </Button>
        </TabsContent>
      </Tabs>

      {/* If no sections yet */}
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

      {/* Delete dialogs */}
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
