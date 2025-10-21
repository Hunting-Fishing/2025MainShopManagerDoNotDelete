import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Plus, Download, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormBuilderEditor } from '@/components/forms/builder/FormBuilderEditor';
import { FormRenderer } from '@/components/forms/FormRenderer';
import { getAllFormTemplates, deleteFormTemplate } from '@/services/formBuilderService';
import { FormBuilderTemplate } from '@/types/formBuilder';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Forms() {
  const [templates, setTemplates] = useState<Partial<FormBuilderTemplate>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormBuilderTemplate | undefined>();
  const [previewTemplate, setPreviewTemplate] = useState<FormBuilderTemplate | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await getAllFormTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: Partial<FormBuilderTemplate>) => {
    // Load full template for editing
    setEditingTemplate(template as FormBuilderTemplate);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    setIsEditorOpen(false);
    loadTemplates();
  };

  const handlePreview = (template: FormBuilderTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      const success = await deleteFormTemplate(id);
      if (success) {
        toast({ title: 'Form deleted successfully' });
        loadTemplates();
      } else {
        toast({ title: 'Failed to delete form', variant: 'destructive' });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Forms | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forms Management</h1>
            <p className="text-muted-foreground">
              Create and manage customer forms, work order templates, and documents
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">
                Active form templates
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter(t => t.isPublished).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Available to users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Forms</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter(t => !t.isPublished).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending completion
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(templates.map(t => t.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Form Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No forms yet. Create your first form to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant={template.isPublished ? 'default' : 'secondary'}>
                            {template.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id!)}
                        >
                          <FileCheck className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Form' : 'Create New Form'}
            </DialogTitle>
          </DialogHeader>
          <FormBuilderEditor
            template={editingTemplate}
            onSave={handleSave}
            onPreview={handlePreview}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <FormRenderer
              templateId={previewTemplate.id}
              onSubmit={(data) => {
                console.log('Preview submission:', data);
                toast({ title: 'Form submitted (preview mode)' });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}