
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types/customer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SendSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
}

export const SendSmsDialog: React.FC<SendSmsDialogProps> = ({
  open,
  onOpenChange,
  customer
}) => {
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // If customer phone is not available, we'll disable sending
  const isPhoneAvailable = customer && customer.phone && customer.phone.trim().length > 0;

  // Fetch SMS templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['smsTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sms_templates').select('*');
      if (error) throw error;
      return data || [];
    },
    // Only fetch when dialog is open to avoid unnecessary requests
    enabled: open,
  });

  // Apply template content when a template is selected
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        let content = template.content;
        
        // Replace placeholders with customer data
        content = content.replace(/\{first_name\}/g, customer.first_name || '');
        content = content.replace(/\{last_name\}/g, customer.last_name || '');
        content = content.replace(/\{full_name\}/g, `${customer.first_name || ''} ${customer.last_name || ''}`.trim());
        
        setMessage(content);
      }
    }
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setMessage("");
      setSelectedTemplate("");
      setIsSending(false);
    }
  }, [open]);

  const handleSendSms = async () => {
    if (!message || !isPhoneAvailable) return;
    
    setIsSending(true);
    
    try {
      // In a real implementation, this would call a Supabase Edge Function
      // that connects to Twilio or another SMS provider
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Log to SMS logs table
      const { error } = await supabase.from('sms_logs').insert({
        customer_id: customer.id,
        phone_number: customer.phone,
        message: message,
        template_id: selectedTemplate || null,
        status: 'sent' // In a real implementation, this would be set by the response from the SMS provider
      });
      
      if (error) throw error;
      
      toast({
        title: "SMS Sent",
        description: `Message sent to ${customer.first_name} ${customer.last_name}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "Error",
        description: "Failed to send SMS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send SMS</DialogTitle>
        </DialogHeader>
        
        {!isPhoneAvailable ? (
          <div className="text-amber-600">
            This customer doesn't have a phone number. Please add a phone number first.
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="template">Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                  disabled={templatesLoading}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here"
                  className="min-h-[100px]"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Sending to: {customer.phone}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSendSms} 
                disabled={!message || isSending}
              >
                {isSending ? "Sending..." : "Send SMS"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
