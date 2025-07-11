
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { FormTemplate } from '@/types/form';

// Mock data - replace with real service calls
const mockForms: FormTemplate[] = [
  {
    id: '1',
    name: 'Customer Service Request',
    description: 'Standard form for customer service requests',
    category: 'customer-service',
    content: { sections: [] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    is_published: true,
    created_by: 'user1',
    tags: ['service', 'customer']
  },
  {
    id: '2',
    name: 'Equipment Inspection',
    description: 'Form for equipment safety inspections',
    category: 'maintenance',
    content: { sections: [] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 2,
    is_published: false,
    created_by: 'user2',
    tags: ['equipment', 'inspection']
  }
];

export default function Forms() {
  const [forms, setForms] = useState<FormTemplate[]>(mockForms);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDeleteForm = async (formId: string) => {
    try {
      setForms(prev => prev.filter(f => f.id !== formId));
      toast({
        title: "Form deleted",
        description: "The form has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (formId: string) => {
    try {
      setForms(prev => 
        prev.map(form => 
          form.id === formId 
            ? { ...form, is_published: !form.is_published }
            : form
        )
      );
      toast({
        title: "Form updated",
        description: "Form publication status has been updated.",
      });
    } catch (error) {
      console.error('Error updating form:', error);
      toast({
        title: "Error",
        description: "Failed to update form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms & Templates</h1>
          <p className="text-muted-foreground">
            Create and manage custom forms for your business processes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No forms created yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first custom form to streamline your business processes.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.description}
                    </p>
                  </div>
                  <Badge variant={form.is_published ? 'default' : 'secondary'}>
                    {form.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {form.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Version {form.version} • Updated {new Date(form.updated_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTogglePublish(form.id)}
                    >
                      {form.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteForm(form.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Form Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg border-2 border-dashed border-muted">
              <div className="text-2xl font-bold">
                {forms.filter(f => f.category === 'customer-service').length}
              </div>
              <div className="text-sm text-muted-foreground">Customer Service</div>
            </div>
            <div className="text-center p-4 rounded-lg border-2 border-dashed border-muted">
              <div className="text-2xl font-bold">
                {forms.filter(f => f.category === 'maintenance').length}
              </div>
              <div className="text-sm text-muted-foreground">Maintenance</div>
            </div>
            <div className="text-center p-4 rounded-lg border-2 border-dashed border-muted">
              <div className="text-2xl font-bold">
                {forms.filter(f => f.category === 'inspection').length}
              </div>
              <div className="text-sm text-muted-foreground">Inspection</div>
            </div>
            <div className="text-center p-4 rounded-lg border-2 border-dashed border-muted">
              <div className="text-2xl font-bold">
                {forms.filter(f => f.is_published).length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
