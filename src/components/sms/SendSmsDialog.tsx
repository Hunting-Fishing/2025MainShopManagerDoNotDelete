
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmsTemplate } from "./SmsTemplatesList";

const formSchema = z.object({
  templateId: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type FormValues = z.infer<typeof formSchema>;

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
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = React.useState<SmsTemplate | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: "",
      message: "",
    }
  });

  const messageValue = watch("message");

  // Fetch SMS templates
  const { data: templates } = useQuery({
    queryKey: ['smsTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  React.useEffect(() => {
    if (open) {
      reset({
        templateId: "",
        message: "",
      });
    }
  }, [open, reset]);

  const sendSmsMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Validate phone number
      if (!customer.phone) {
        throw new Error("Customer doesn't have a phone number");
      }

      const response = await fetch('/functions/v1/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          phoneNumber: customer.phone,
          message: data.message,
          customerId: customer.id,
          templateId: data.templateId || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send SMS');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Sent",
        description: `Message sent successfully to ${customer.phone}`,
        variant: "success",
      });
      
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to send SMS",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId) || null;
    setSelectedTemplate(template);
    
    if (template) {
      setValue("templateId", template.id);
      
      // Process template content to replace variables
      let processedContent = template.content;
      processedContent = processedContent.replace(/{customer_name}/g, `${customer.first_name} ${customer.last_name}`);
      processedContent = processedContent.replace(/{first_name}/g, customer.first_name);
      processedContent = processedContent.replace(/{last_name}/g, customer.last_name);
      
      setValue("message", processedContent);
    } else {
      setValue("templateId", "");
    }
  };

  const onSubmit = (data: FormValues) => {
    sendSmsMutation.mutate(data);
  };

  const getCharacterCount = () => {
    return messageValue ? messageValue.length : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send SMS to Customer</DialogTitle>
          <DialogDescription>
            Send an SMS message to {customer.first_name} {customer.last_name} at {customer.phone}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {!customer.phone ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                This customer doesn't have a phone number. Please add a phone number before sending SMS.
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="template">Select Template (Optional)</Label>
                  <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or write a custom message" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Write a custom message</SelectItem>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Enter your message here"
                    rows={5}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Characters: {getCharacterCount()}</span>
                    <span>
                      {getCharacterCount() > 160 ? 
                        `${Math.ceil(getCharacterCount() / 153)} SMS segments` : 
                        '1 SMS'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !customer.phone}
            >
              {isSubmitting ? "Sending..." : "Send SMS"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
