
import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react"; // Changed from FileTemplate to FileText
import { InvoiceTemplate } from "@/types/invoice";

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
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Load Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Invoice Template</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-72">
          <div className="space-y-2">
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 cursor-pointer rounded-md hover:bg-muted"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    )}
                  </div>
                  <Button size="sm" variant="ghost">
                    Select
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center p-4 text-muted-foreground">
                No templates available. Save an invoice as a template first.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
