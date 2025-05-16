
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceTemplate } from "@/types/invoice";
import { Calendar, User, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InvoiceTemplateDialogProps {
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateDialog({ templates, onSelectTemplate }: InvoiceTemplateDialogProps) {
  const [open, setOpen] = useState(false);

  const handleTemplateSelect = (template: InvoiceTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <FileText size={16} />
        Load Template
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Invoice Templates</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No templates found</p>
                <p className="text-sm mt-1">Create a new template by saving an invoice</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-100 rounded-md p-2 text-slate-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-slate-500">{template.description}</p>
                          
                          <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>
                                {template.invoice_template_items ? template.invoice_template_items.length : 0} items
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>
                                Used {template.usage_count} times
                              </span>
                            </div>
                            {template.last_used && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>
                                  Used {formatDistanceToNow(new Date(template.last_used))} ago
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto whitespace-nowrap">
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
