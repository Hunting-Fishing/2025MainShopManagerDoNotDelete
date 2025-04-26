
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InvoiceTemplate } from '@/types/invoice';
import { Files } from 'lucide-react'; // Using Files instead of FileTemplate

interface InvoiceTemplateDialogProps {
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateDialog({ templates, onSelectTemplate }: InvoiceTemplateDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSelectTemplate = (template: InvoiceTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Files className="h-4 w-4" />
          Load Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Invoice Template</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh]">
          {templates.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No templates found. Create one by saving an invoice as a template.
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
