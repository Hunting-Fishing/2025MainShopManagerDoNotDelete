
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmailTemplateEditor } from "@/components/email/template/EmailTemplateEditor";
import { useEmailTemplates } from "@/hooks/email/useEmailTemplates";
import { EmailCategory, EmailTemplate } from "@/types/email";
import { Plus, FileText, Calendar, Search, AlertTriangle, Edit, Copy, Trash2, SendHorizontal } from "lucide-react";
import { format } from "date-fns";

export default function EmailTemplates() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendTestModalOpen, setIsSendTestModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EmailCategory | undefined>(undefined);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [templateToTest, setTemplateToTest] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    templates, 
    loading, 
    fetchTemplateById,
    createTemplate, 
    updateTemplate,
    deleteTemplate,
    sendTestEmail
  } = useEmailTemplates(activeCategory);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = async (template: Partial<EmailTemplate>) => {
    const result = await createTemplate(template);
    if (result) {
      setIsCreateModalOpen(false);
    }
    return result;
  };

  const handleEditClick = async (templateId: string) => {
    const template = await fetchTemplateById(templateId);
    if (template) {
      setTemplateToEdit(template);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateTemplate = async (template: Partial<EmailTemplate>) => {
    if (!templateToEdit) return null;
    
    const result = await updateTemplate(templateToEdit.id, template);
    if (result) {
      setIsEditModalOpen(false);
      setTemplateToEdit(null);
    }
    return result;
  };

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    
    const success = await deleteTemplate(templateToDelete);
    if (success) {
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSendTestClick = (templateId: string) => {
    setTemplateToTest(templateId);
    setIsSendTestModalOpen(true);
  };

  const handleSendTest = async () => {
    if (!templateToTest || !testEmailRecipient) return;
    
    const success = await sendTestEmail(templateToTest, testEmailRecipient);
    if (success) {
      setIsSendTestModalOpen(false);
      setTemplateToTest(null);
      setTestEmailRecipient("");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your email templates for marketing and communication
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <div className="space-y-1">
                  <Button
                    variant={activeCategory === undefined ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(undefined)}
                  >
                    All Templates
                  </Button>
                  {[
                    { value: 'marketing', label: 'Marketing', icon: <FileText className="mr-2 h-4 w-4" /> },
                    { value: 'transactional', label: 'Transactional', icon: <FileText className="mr-2 h-4 w-4" /> },
                    { value: 'reminder', label: 'Reminder', icon: <Calendar className="mr-2 h-4 w-4" /> },
                    { value: 'welcome', label: 'Welcome', icon: <FileText className="mr-2 h-4 w-4" /> },
                    { value: 'follow_up', label: 'Follow-up', icon: <FileText className="mr-2 h-4 w-4" /> },
                    { value: 'survey', label: 'Survey', icon: <FileText className="mr-2 h-4 w-4" /> },
                    { value: 'custom', label: 'Custom', icon: <FileText className="mr-2 h-4 w-4" /> },
                  ].map((category) => (
                    <Button
                      key={category.value}
                      variant={activeCategory === category.value ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setActiveCategory(category.value as EmailCategory)}
                    >
                      {category.icon}
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3 lg:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                {activeCategory 
                  ? `Showing ${filteredTemplates.length} ${activeCategory} templates` 
                  : `Showing ${filteredTemplates.length} templates across all categories`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading templates...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">No templates found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery
                      ? `No templates matching "${searchQuery}"`
                      : activeCategory
                      ? `No templates in the ${activeCategory} category`
                      : "You haven't created any templates yet"}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {template.subject}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {template.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(template.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(template.id)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendTestClick(template.id)}
                              >
                                <SendHorizontal className="h-4 w-4" />
                                <span className="sr-only">Send Test</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
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
        </div>
      </div>
      
      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
          </DialogHeader>
          <EmailTemplateEditor
            onSave={handleCreateTemplate}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
          </DialogHeader>
          {templateToEdit && (
            <EmailTemplateEditor
              template={templateToEdit}
              onSave={handleUpdateTemplate}
              onSendTest={sendTestEmail}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Send Test Email Modal */}
      <Dialog open={isSendTestModalOpen} onOpenChange={setIsSendTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Recipient Email
              </label>
              <Input
                id="recipient"
                placeholder="recipient@example.com"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSendTestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendTest}
                disabled={!testEmailRecipient}
              >
                Send Test
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
