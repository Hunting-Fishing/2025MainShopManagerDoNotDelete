
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceTemplate } from "@/types/invoice";
import { FileTemplate } from "lucide-react";

interface InvoiceTemplateDialogProps {
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateDialog({ 
  templates, 
  onSelectTemplate 
}: InvoiceTemplateDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (template: InvoiceTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <FileTemplate className="h-4 w-4" />
          <span>Templates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No templates available
            </p>
          ) : (
            <div className="space-y-4 mt-2">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-all"
                  onClick={() => handleSelect(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template);
                      }}
                    >
                      Use
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="inline-block mr-4">
                      Items: {template.defaultItems.length}
                    </span>
                    <span className="inline-block mr-4">
                      Used: {template.usageCount} times
                    </span>
                    {template.lastUsed && (
                      <span>
                        Last used: {new Date(template.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
