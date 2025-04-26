
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceTemplate } from '@/types/invoice';
import { formatDate } from '@/utils/formatters';

interface InvoiceTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateDialog({ 
  open, 
  onClose, 
  templates, 
  onSelectTemplate 
}: InvoiceTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Invoice Template</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] overflow-y-auto mt-4">
          <div className="space-y-4 p-1">
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates available
              </p>
            ) : (
              templates.map((template) => (
                <div 
                  key={template.id}
                  className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      Used {template.usage_count} times
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description || 'No description'}
                  </p>
                  
                  <div className="flex justify-between items-center mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tax Rate: </span>
                      <span>{template.default_tax_rate * 100}%</span>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Due In: </span>
                      <span>{template.default_due_date_days} days</span>
                    </div>
                    
                    {template.last_used && (
                      <div>
                        <span className="text-muted-foreground">Last Used: </span>
                        <span>{formatDate(template.last_used)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
