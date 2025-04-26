
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceItem, Invoice, InvoiceTemplate, convertToTemplateItems } from "@/types/invoice";
import { Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  defaultNotes: z.string().optional(),
  defaultDueDateDays: z.coerce.number().int().min(0).default(30),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface SaveTemplateDialogProps {
  currentInvoice: Invoice;
  taxRate: number;
  onSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SaveTemplateDialog({ 
  currentInvoice, 
  taxRate, 
  onSaveTemplate,
  open: externalOpen,
  onOpenChange
}: SaveTemplateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = externalOpen !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultNotes: currentInvoice.notes || "",
      defaultDueDateDays: 30,
      defaultTaxRate: taxRate,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Convert the items to template format
    const templateItems = convertToTemplateItems(currentInvoice.items);

    const template = {
      name: values.name,
      description: values.description || "",
      defaultNotes: values.defaultNotes || "",
      defaultDueDateDays: values.defaultDueDateDays,
      defaultTaxRate: values.defaultTaxRate,
      lastUsed: null,
      defaultItems: templateItems,
    };

    onSaveTemplate(template);
    setOpen(false);
    form.reset();
  };

  return (
    <>
      {!isControlled && (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          Save as Template
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard Service Invoice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this template"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultDueDateDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Due Days</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormDescription>
                        Days until payment is due
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} step={0.1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="defaultNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Template</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
