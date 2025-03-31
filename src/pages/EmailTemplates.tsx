import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import { useEmailTemplates } from '@/hooks/email/useEmailTemplates';
import { EmailCategory, EmailTemplatePreview } from '@/types/email';
import { format } from 'date-fns';
import { 
  Plus, MoreVertical, Copy, Edit, Trash, Eye, Send, 
  Filter, LayoutTemplate, Check, ArrowRight, AlertCircle 
} from 'lucide-react';

export default function EmailTemplates() {
  const [activeCategory, setActiveCategory] = useState<EmailCategory | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { templates, loading } = useEmailTemplates();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === activeCategory);

  const handleCategoryChange = (category: EmailCategory | 'all') => {
    setActiveCategory(category);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleCreateTemplate = () => {
    navigate('/email-templates/new');
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/email-templates/${templateId}/edit`);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    toast({
      title: "Template Duplicated",
      description: "The email template has been duplicated successfully",
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    toast({
      title: "Template Deleted",
      description: "The email template has been deleted successfully",
    });
  };

  const handleSendTestEmail = (templateId: string) => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent using this template",
    });
  };

  // Update the component to handle cases where description might be missing
  const TemplateCard = ({ template }: { template: EmailTemplatePreview }) => {
    const navigate = useNavigate();
    const description = template.description || "No description available";
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-lg font-semibold truncate">{template.name}</CardTitle>
          <CardDescription className="line-clamp-2" title={description}>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="px-2 py-0 text-xs">
              {template.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(template.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-2 pt-0 bg-muted/50 flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => navigate(`/email-templates/${template.id}`)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigate(`/email-templates/${template.id}/preview`)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Preview</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email templates for your marketing campaigns
          </p>
        </div>
        <Button asChild>
          <a href="/email-templates/new">
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Manage and organize your email templates
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="md:w-64"
              />
              {searchTerm && (
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Clear Search</span>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleCategoryChange('all')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'all' ? 'visible' : 'hidden',
                      }}
                    />
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('marketing')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'marketing' ? 'visible' : 'hidden',
                      }}
                    />
                    Marketing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('transactional')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'transactional' ? 'visible' : 'hidden',
                      }}
                    />
                    Transactional
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('reminder')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'reminder' ? 'visible' : 'hidden',
                      }}
                    />
                    Reminder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('welcome')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'welcome' ? 'visible' : 'hidden',
                      }}
                    />
                    Welcome
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('follow_up')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'follow_up' ? 'visible' : 'hidden',
                      }}
                    />
                    Follow Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('survey')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'survey' ? 'visible' : 'hidden',
                      }}
                    />
                    Survey
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCategoryChange('custom')}>
                    <Check
                      className="mr-2 h-4 w-4"
                      style={{
                        visibility: activeCategory === 'custom' ? 'visible' : 'hidden',
                      }}
                    />
                    Custom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No templates found</p>
              <Button asChild className="mt-4">
                <a href="/email-templates/new">
                  <Plus className="mr-2 h-4 w-4" /> Create Template
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Choose a category and name for your new email template
            </DialogDescription>
          </DialogHeader>
          {/* Add form or content for creating a new template */}
        </DialogContent>
      </Dialog>

      {/* Filter Templates Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Templates</DialogTitle>
            <DialogDescription>
              Select the categories to filter your email templates
            </DialogDescription>
          </DialogHeader>
          {/* Add filter options here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
