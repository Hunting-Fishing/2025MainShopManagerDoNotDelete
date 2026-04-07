import { useState } from 'react';
import { useGameDevStore } from '@/stores/game-dev-store';
import { GameDevProjectSelector } from '@/components/game-development/GameDevProjectSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Image, Music, Box, FileText, Filter } from 'lucide-react';

const ASSET_TYPES = ['sprite', 'texture', 'model', 'audio', 'animation', 'ui', 'shader', 'script', 'other'] as const;
const ASSET_STATUSES = ['needed', 'in_progress', 'review', 'approved', 'integrated'] as const;
const PRIORITY_CONFIG: Record<string, { label: string; class: string }> = {
  critical: { label: 'Critical', class: 'bg-destructive text-destructive-foreground' },
  high: { label: 'High', class: 'bg-orange-500/20 text-orange-400' },
  medium: { label: 'Medium', class: 'bg-primary/20 text-primary' },
  low: { label: 'Low', class: 'bg-muted text-muted-foreground' },
};

export default function GameDevAssets() {
  const { assetRequirements, addAssetRequirement, updateAssetRequirement, removeAssetRequirement, activeProjectId } = useGameDevStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'sprite' as string, priority: 'medium', description: '', assignedTo: '' });

  const projectAssets = assetRequirements.filter(a => a.projectId === activeProjectId);
  const filtered = projectAssets
    .filter(a => typeFilter === 'all' || a.type === typeFilter)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.name.trim() || !activeProjectId) return;
    addAssetRequirement({
      projectId: activeProjectId,
      name: form.name,
      type: form.type as any,
      priority: form.priority as any,
      description: form.description,
      assignedTo: form.assignedTo || undefined,
      status: 'needed',
    });
    setForm({ name: '', type: 'sprite', priority: 'medium', description: '', assignedTo: '' });
    setDialogOpen(false);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'sprite': case 'texture': case 'ui': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'model': case 'animation': return <Box className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (!activeProjectId) {
    return (
      <div className="p-6 space-y-4">
        <GameDevProjectSelector />
        <Card><CardContent className="py-12 text-center text-muted-foreground">Select a project to manage assets.</CardContent></Card>
      </div>
    );
  }

  const statusCounts = ASSET_STATUSES.reduce((acc, s) => {
    acc[s] = projectAssets.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Asset Pipeline</h1>
          <p className="text-sm text-muted-foreground">{projectAssets.length} assets tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <GameDevProjectSelector />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Asset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Asset Requirement</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Asset name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ASSET_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(PRIORITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Input placeholder="Assigned to (optional)" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <Button onClick={handleAdd} className="w-full">Create Asset</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-5 gap-2">
        {ASSET_STATUSES.map(s => (
          <Card key={s} className="text-center p-2">
            <p className="text-xs text-muted-foreground capitalize">{s.replace('_', ' ')}</p>
            <p className="text-lg font-bold">{statusCounts[s] || 0}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ASSET_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Asset list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No assets found. Add your first asset requirement.</CardContent></Card>
        ) : filtered.map(asset => (
          <Card key={asset.id} className="hover:bg-accent/30 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="text-muted-foreground">{typeIcon(asset.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{asset.name}</p>
                {asset.description && <p className="text-xs text-muted-foreground truncate">{asset.description}</p>}
              </div>
              <Badge variant="outline" className="text-xs capitalize">{asset.type}</Badge>
              <Badge className={`text-xs ${PRIORITY_CONFIG[asset.priority]?.class || ''}`}>{asset.priority}</Badge>
              <Select value={asset.status} onValueChange={v => updateAssetRequirement(asset.id, { status: v as any })}>
                <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ASSET_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeAssetRequirement(asset.id)}>×</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
