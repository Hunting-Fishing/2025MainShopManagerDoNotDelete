
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SmsTemplate } from "./SmsTemplatesList";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Template content is required"),
  description: z.string().optional(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SmsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: SmsTemplate | null;
}

export const SmsTemplateDialog: React.FC<SmsTemplateDialogProps> = ({
  open,
  onOpenChange,
  template
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!template;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      content: template?.content || "",
      description: template?.description || "",
      category: template?.category || "",
    }
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: template?.name || "",
        content: template?.content || "",
        description: template?.description || "",
        category: template?.category || "",
      });
    }
  }, [open, template, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isEditing) {
        const { error } = await supabase
          .from('sms_templates')
          .update(data)
          .eq('id', template.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sms_templates')
          .insert(data);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smsTemplates'] });
      
      toast({
        title: isEditing ? "Template updated" : "Template created",
        description: isEditing 
          ? "The SMS template has been updated successfully."
          : "The SMS template has been created successfully.",
        variant: "success",
      });
      
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save template: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    saveMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit SMS Template" : "Create SMS Template"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update this SMS template that you can use to send messages to customers."
              : "Create a new SMS template that you can use to send messages to customers."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Appointment Reminder"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="Reminders"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Template used for appointment reminders"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Hi {customer_name}, this is a reminder about your appointment on {appointment_date} at {appointment_time}. Reply Y to confirm or N to reschedule."
                rows={5}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                You can use placeholders like {"{customer_name}"}, {"{appointment_date}"}, etc. which will be replaced with actual values when sending.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
