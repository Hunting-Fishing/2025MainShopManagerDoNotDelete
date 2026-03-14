import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Tag, Loader2, FolderOpen } from 'lucide-react';
import { useExportProductCategories, useCreateExportCategory, useDeleteExportCategory } from '@/hooks/export/useExportProductCategories';

export function ExportCategoryManager() {
  const { data: categories = [], isLoading } = useExportProductCategories();
  const createCategory = useCreateExportCategory();
  const deleteCategory = useDeleteExportCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCategory.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
    setName('');
    setDescription('');
    setDialogOpen(false);
  };

  const systemCats = categories.filter(c => c.is_system);
  const customCats = categories.filter(c => !c.is_system);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Product Categories</h1>
          <p className="text-xs text-muted-foreground">{categories.length} categories available</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Category Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frozen Goods" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief description..." />
              </div>
              <Button onClick={handleCreate} disabled={!name.trim() || createCategory.isPending} className="w-full">
                {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          {/* System Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-emerald-600" /> Default Categories ({systemCats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {systemCats.map(cat => (
                  <Badge key={cat.id} variant="secondary" className="text-xs py-1 px-2.5">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-600" /> Custom Categories ({customCats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customCats.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">No custom categories yet. Add one above.</p>
              ) : (
                <div className="space-y-2">
                  {customCats.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{cat.name}</p>
                        {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteCategory.mutate(cat.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
