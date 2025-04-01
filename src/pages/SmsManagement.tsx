
import React, { useState } from 'react';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, MessageSquare, History, FileText, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { customers } from '@/data/customersData';

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

interface SmsLogEntry {
  id: string;
  recipient: string;
  message: string;
  status: 'delivered' | 'failed' | 'pending';
  timestamp: string;
}

// Mock data for SMS templates
const mockTemplates: SmsTemplate[] = [
  {
    id: "1",
    name: "Appointment Reminder",
    content: "Hi {firstName}, this is a reminder about your appointment tomorrow at {time}. Reply Y to confirm or call us to reschedule.",
    category: "Reminders"
  },
  {
    id: "2",
    name: "Work Order Complete",
    content: "Hi {firstName}, your work order #{workOrderId} has been completed. Thank you for choosing our services!",
    category: "Notifications"
  },
  {
    id: "3",
    name: "Payment Received",
    content: "Hi {firstName}, we've received your payment of ${amount} for invoice #{invoiceId}. Thank you!",
    category: "Billing"
  }
];

// Mock data for SMS logs
const mockLogs: SmsLogEntry[] = [
  {
    id: "log1",
    recipient: "Acme Corporation",
    message: "Hi John, this is a reminder about your appointment tomorrow at 2:00 PM. Reply Y to confirm or call us to reschedule.",
    status: "delivered",
    timestamp: "2023-09-15T14:30:00Z"
  },
  {
    id: "log2",
    recipient: "Johnson Residence",
    message: "Hi Sarah, your work order #WO-2023-0011 has been completed. Thank you for choosing our services!",
    status: "delivered",
    timestamp: "2023-09-14T16:45:00Z"
  },
  {
    id: "log3",
    recipient: "City Hospital",
    message: "Hi Michael, we've received your payment of $3200.00 for invoice #INV-2023-003. Thank you!",
    status: "failed",
    timestamp: "2023-09-13T09:15:00Z"
  }
];

export default function SmsManagement() {
  const [activeTab, setActiveTab] = useState("send");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState(mockTemplates);
  const [logs, setLogs] = useState(mockLogs);
  
  // Form state for new template
  const [newTemplate, setNewTemplate] = useState<Omit<SmsTemplate, 'id'>>({
    name: "",
    content: "",
    category: "Reminders"
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        let content = template.content;
        
        // Replace placeholders with sample values if no customer is selected
        if (!selectedCustomer) {
          content = content
            .replace(/{firstName}/g, "Customer")
            .replace(/{workOrderId}/g, "WO-XXXX")
            .replace(/{invoiceId}/g, "INV-XXXX")
            .replace(/{amount}/g, "0.00")
            .replace(/{time}/g, "10:00 AM");
        } else {
          const customer = customers.find(c => c.id === selectedCustomer);
          if (customer) {
            content = content
              .replace(/{firstName}/g, customer.first_name)
              .replace(/{workOrderId}/g, "WO-2023-XXXX")
              .replace(/{invoiceId}/g, "INV-2023-XXXX")
              .replace(/{amount}/g, "100.00")
              .replace(/{time}/g, "10:00 AM");
          }
        }
        
        setMessageText(content);
      }
    } else {
      setMessageText("");
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    
    // If a template is already selected, update the message with customer info
    if (selectedTemplate) {
      handleTemplateSelect(selectedTemplate);
    }
  };

  const handleSendMessage = async () => {
    // Validate inputs
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a recipient",
        variant: "destructive",
      });
      return;
    }
    
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real app, you would send this to your SMS API
      console.log("Sending SMS:", {
        recipient: selectedCustomer,
        message: messageText
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to logs
      const customer = customers.find(c => c.id === selectedCustomer);
      const newLog: SmsLogEntry = {
        id: `log${Date.now()}`,
        recipient: customer ? customer.name : "Unknown",
        message: messageText,
        status: "delivered",
        timestamp: new Date().toISOString()
      };
      
      setLogs([newLog, ...logs]);
      
      // Reset form
      setMessageText("");
      setSelectedCustomer("");
      setSelectedTemplate("");
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateTemplate = () => {
    // Validate inputs
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Template name and content are required",
        variant: "destructive",
      });
      return;
    }
    
    // Add new template
    const template: SmsTemplate = {
      ...newTemplate,
      id: `template${Date.now()}`
    };
    
    setTemplates([...templates, template]);
    
    // Reset form and close dialog
    setNewTemplate({
      name: "",
      content: "",
      category: "Reminders"
    });
    
    setShowTemplateDialog(false);
    
    toast({
      title: "Success",
      description: "Template created successfully",
    });
  };

  return (
    <ResponsiveContainer className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">SMS Management</h1>
          <p className="text-muted-foreground">
            Send SMS messages and manage templates
          </p>
        </div>
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create SMS Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input 
                    id="templateName" 
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Appointment Reminder" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateCategory">Category</Label>
                  <Select 
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}
                  >
                    <SelectTrigger id="templateCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reminders">Reminders</SelectItem>
                      <SelectItem value="Notifications">Notifications</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateContent">Template Content</Label>
                <Textarea 
                  id="templateContent" 
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  placeholder="Message content with placeholders like {firstName}, {workOrderId}, etc." 
                  className="h-40" 
                />
                <p className="text-sm text-muted-foreground">
                  Available placeholders: {'{firstName}'}, {'{workOrderId}'}, {'{invoiceId}'}, {'{amount}'}, {'{time}'}
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Message History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Send SMS Message
              </CardTitle>
              <CardDescription>
                Send an SMS message to a customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select 
                    value={selectedCustomer}
                    onValueChange={handleCustomerSelect}
                  >
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select 
                    value={selectedTemplate}
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template or type a custom message" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No template - custom message</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here" 
                  className="h-[150px]" 
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Character count: {messageText.length}</span>
                  <span>Messages: {Math.ceil(messageText.length / 160) || 0}</span>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSendMessage} disabled={isSending}>
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2" />
                SMS Templates
              </CardTitle>
              <CardDescription>
                Manage your SMS templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <div className="bg-muted px-4 py-2 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleTemplateSelect(template.id)}>
                          Use
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                    </div>
                  </Card>
                ))}
                
                {templates.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No templates found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                      You don't have any SMS templates yet. Create your first template to get started.
                    </p>
                    <Button onClick={() => setShowTemplateDialog(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <History className="h-5 w-5 mr-2" />
                Message History
              </CardTitle>
              <CardDescription>
                View your sent messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="overflow-hidden">
                    <div className="bg-muted px-4 py-2 flex justify-between items-center">
                      <div>
                        <span className="font-medium">To: {log.recipient}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          log.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm whitespace-pre-wrap">{log.message}</p>
                    </div>
                  </Card>
                ))}
                
                {logs.length === 0 && (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No message history</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      You haven't sent any SMS messages yet. Go to the Send Message tab to send your first message.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ResponsiveContainer>
  );
}
