
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
  FileEdit, 
  Trash2, 
  Copy, 
  Mail, 
  BarChart4, 
  Users, 
  Settings,
  Play
} from 'lucide-react';
import { EmailAnalyticsDashboard } from '@/components/email/analytics/EmailAnalyticsDashboard';
import { SegmentBuilder } from '@/components/email/segmentation/SegmentBuilder';
import { AutomationRuleBuilder } from '@/components/email/automation/AutomationRuleBuilder';

export default function EmailTemplates() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplatePreview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EmailCategory | 'all'>('all');
  const { templates, loading, fetchTemplates, deleteTemplate } = useEmailTemplates();
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

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
    navigate(`/email-template-editor/duplicate/${template.id}`);
  };
  
  const handleTestEmail = (template: EmailTemplatePreview) => {
    setSelectedTemplate(template);
    setIsTestModalOpen(true);
  };
  
  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return;
    
    try {
      const { data: templateData } = await useEmailTemplates().getTemplateById(selectedTemplate.id);
      
      if (!templateData) {
        toast({
          title: "Error",
          description: "Failed to load template data",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.functions.invoke('send-test-email', {
        body: {
          email: testEmail,
          subject: selectedTemplate.subject,
          content: templateData.content,
          includeTracking: true,
          campaignId: 'test-' + Date.now()
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Test email sent to ${testEmail}`,
      });
      
      setIsTestModalOpen(false);
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      });
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Email Marketing Center</h1>
          <p className="text-muted-foreground">
            Manage your email marketing campaigns, templates, segments and automations
          </p>
        </div>
        {activeTab === 'templates' && (
          <Button onClick={() => navigate('/email-template-editor')}>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        )}
        {activeTab === 'segments' && (
          <Button onClick={() => setActiveTab('new-segment')}>
            <Users className="mr-2 h-4 w-4" /> Create Segment
          </Button>
        )}
        {activeTab === 'automation' && (
          <Button onClick={() => setActiveTab('new-automation')}>
            <Play className="mr-2 h-4 w-4" /> Create Automation Rule
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Create and manage reusable email templates
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
                                onClick={() => handleTestEmail(template)}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Test
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(template)}
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicate(template)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
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
        </TabsContent>
        
        <TabsContent value="analytics">
          <EmailAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Create and manage customer segments for targeted email marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentsList setActiveTab={setActiveTab} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new-segment">
          <SegmentBuilder onSave={() => {
            setActiveTab('segments');
            toast({
              title: "Success",
              description: "Segment created successfully"
            });
          }} />
        </TabsContent>
        
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Automation</CardTitle>
              <CardDescription>
                Create automated marketing workflows based on customer behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationRulesList setActiveTab={setActiveTab} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new-automation">
          <AutomationRuleBuilder onSave={() => {
            setActiveTab('automation');
            toast({
              title: "Success",
              description: "Automation rule created successfully"
            });
          }} />
        </TabsContent>
      </Tabs>
      
      {/* Test Email Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test version of this template to any email address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template</Label>
              <Input
                id="templateName"
                value={selectedTemplate?.name || ''}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testEmail">Recipient Email</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="your.email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
            <Button onClick={sendTestEmail} disabled={!testEmail}>Send Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SegmentsList = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('marketing_segments')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Count members for each segment
        const segmentsWithCounts = await Promise.all(
          (data || []).map(async (segment) => {
            const { count, error: countError } = await supabase
              .from('marketing_segment_members')
              .select('*', { count: 'exact', head: true })
              .eq('segment_id', segment.id);
              
            return {
              ...segment,
              memberCount: countError ? 0 : count || 0
            };
          })
        );
        
        setSegments(segmentsWithCounts);
      } catch (err) {
        console.error('Error fetching segments:', err);
        toast({
          title: 'Error',
          description: 'Failed to load segments',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSegments();
  }, [toast]);
  
  const handleEdit = (segmentId: string) => {
    navigate(`/email-segments/${segmentId}`);
  };
  
  const handleDelete = async (segmentId: string) => {
    try {
      // First delete segment members
      await supabase
        .from('marketing_segment_members')
        .delete()
        .eq('segment_id', segmentId);
        
      // Then delete segment rules  
      await supabase
        .from('segment_rules')
        .delete()
        .eq('segment_id', segmentId);
        
      // Finally delete segment
      const { error } = await supabase
        .from('marketing_segments')
        .delete()
        .eq('id', segmentId);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Segment deleted successfully'
      });
      
      // Refresh segments list
      const { data } = await supabase
        .from('marketing_segments')
        .select('*')
        .order('created_at', { ascending: false });
        
      setSegments(data || []);
    } catch (err) {
      console.error('Error deleting segment:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete segment',
        variant: 'destructive'
      });
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading segments...</div>;
  }
  
  if (segments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No segments found</p>
        <Button onClick={() => setActiveTab('new-segment')} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Create Segment
        </Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Segment Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((segment) => (
            <TableRow key={segment.id}>
              <TableCell>
                <div className="font-medium">{segment.name}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {segment.description}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {segment.segment_type}
                </Badge>
              </TableCell>
              <TableCell>{segment.memberCount}</TableCell>
              <TableCell>
                {format(new Date(segment.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(segment.id)}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(segment.id)}
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
  );
};

const AutomationRulesList = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('marketing_automation_rules')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setRules(data || []);
      } catch (err) {
        console.error('Error fetching automation rules:', err);
        toast({
          title: 'Error',
          description: 'Failed to load automation rules',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
  }, [toast]);
  
  const handleEdit = (ruleId: string) => {
    navigate(`/email-automation/${ruleId}`);
  };
  
  const handleToggleActive = async (ruleId: string, currentActiveState: boolean) => {
    try {
      const { error } = await supabase
        .from('marketing_automation_rules')
        .update({ is_active: !currentActiveState })
        .eq('id', ruleId);
        
      if (error) throw error;
      
      // Update local state
      setRules(prevRules => prevRules.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
      ));
      
      toast({
        title: 'Success',
        description: `Rule ${!currentActiveState ? 'activated' : 'deactivated'} successfully`
      });
    } catch (err) {
      console.error('Error toggling rule status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update rule status',
        variant: 'destructive'
      });
    }
  };
  
  const handleDelete = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_automation_rules')
        .delete()
        .eq('id', ruleId);
        
      if (error) throw error;
      
      // Remove from local state
      setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
      
      toast({
        title: 'Success',
        description: 'Rule deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading automation rules...</div>;
  }
  
  if (rules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No automation rules found</p>
        <Button onClick={() => setActiveTab('new-automation')} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Create Automation Rule
        </Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rule Name</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell>
                <div className="font-medium">{rule.name}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {rule.description}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <Badge variant="outline" className="capitalize">
                    {rule.trigger_type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {rule.trigger_type === 'event' && rule.trigger_criteria?.event_type && (
                    <span>On {rule.trigger_criteria.event_type}</span>
                  )}
                  {rule.trigger_type === 'segment_entry' && (
                    <span>When customer joins segment</span>
                  )}
                  {rule.trigger_type === 'date' && (
                    <span>Date-based trigger</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <Badge variant="outline" className="capitalize">
                    {rule.action_type?.replace('_', ' ')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={rule.is_active ? "success" : "secondary"}>
                  {rule.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(rule.id, rule.is_active)}
                  >
                    {rule.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rule.id)}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
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
  );
};

// Import the supabase client
import { supabase } from '@/lib/supabase';
