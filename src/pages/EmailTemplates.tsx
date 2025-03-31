
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEmailTemplates } from '@/hooks/email/useEmailTemplates';
import { EmailCategory, EmailTemplatePreview } from '@/types/email';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  FileEdit, 
  Trash2, 
  Copy, 
  Mail, 
  Tag, 
  Bookmark, 
  CheckCircle, 
  XCircle,
  AlertTriangle 
} from 'lucide-react';

export default function EmailTemplates() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplatePreview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EmailCategory | 'all'>('all');
  const { templates, loading, fetchTemplates, deleteTemplate } = useEmailTemplates();
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = templates
    .filter(template => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(searchTerm) ||
        template.subject.toLowerCase().includes(searchTerm)
      );
    })
    .filter(template => {
      return categoryFilter === 'all' || template.category === categoryFilter;
    });

  const handleEdit = (template: EmailTemplatePreview) => {
    navigate(`/email-template-editor/${template.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = (template: EmailTemplatePreview) => {
    // Implement duplicate logic here
    console.log('Duplicate template:', template);
  };

  const CreatedAtCell = ({ template }: { template: EmailTemplatePreview }) => (
    <div className="text-sm text-muted-foreground">
      {format(new Date(template.created_at), 'MMM d, yyyy')}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email templates for your campaigns
          </p>
        </div>
        <Button onClick={() => navigate('/email-template-editor')}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Manage your email templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Input
                type="search"
                placeholder="Search templates..."
                className="max-w-xs mr-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
            <div className="flex items-center">
              <Label htmlFor="category-filter" className="mr-2">
                Category:
              </Label>
              <select
                id="category-filter"
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as EmailCategory | 'all')}
              >
                <option value="all">All</option>
                <option value="marketing">Marketing</option>
                <option value="transactional">Transactional</option>
                <option value="reminder">Reminder</option>
                <option value="welcome">Welcome</option>
                <option value="follow_up">Follow Up</option>
                <option value="survey">Survey</option>
                <option value="custom">Custom</option>
              </select>
              <Button variant="ghost" size="sm" className="ml-2">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No templates found</p>
              <Button onClick={() => navigate('/email-template-editor')} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create Template
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {template.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <CreatedAtCell template={template} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/email-template-editor/${template.id}`)}
                          >
                            <FileEdit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Define the template details to create reusable email designs.
            </DialogDescription>
          </DialogHeader>
          {/* Implement create template form here */}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Modify the template details to update your email designs.
            </DialogDescription>
          </DialogHeader>
          {/* Implement edit template form here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
