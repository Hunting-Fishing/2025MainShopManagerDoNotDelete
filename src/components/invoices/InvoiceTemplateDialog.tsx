
// Copy from the existing file
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { InvoiceTemplate } from "@/types/invoice";
import { Calendar, ClipboardList } from "lucide-react";

interface InvoiceTemplateDialogProps {
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateDialog({ 
  templates, 
  onSelectTemplate 
}: InvoiceTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectTemplate = (template: InvoiceTemplate) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Invoice Templates</DialogTitle>
          <DialogDescription>
            Select a template to pre-fill your invoice with commonly used items and settings.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 mt-2">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-base">{template.name}</h3>
                    <p className="text-muted-foreground text-sm">{template.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Used {template.usageCount} times
                  </Badge>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mt-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                  {template.lastUsed && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Last used {new Date(template.lastUsed).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Tax Rate:</span>
                    <span>{(template.defaultTaxRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span>{template.defaultDueDateDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Items:</span>
                    <span>{template.defaultItems.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
