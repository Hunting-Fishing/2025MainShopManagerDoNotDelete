
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { Invoice, InvoiceItem, InvoiceTemplate } from "@/types/invoice";
import { toast } from "@/hooks/use-toast";

interface SaveTemplateDialogProps {
  currentInvoice: Invoice;
  taxRate: number;
  onSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
}

export function SaveTemplateDialog({ 
  currentInvoice, 
  taxRate,
  onSaveTemplate 
}: SaveTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [includeItems, setIncludeItems] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [dueDateDays, setDueDateDays] = useState(30);

  const handleSaveTemplate = () => {
    if (!templateName) {
      toast({
        title: "Template name required",
        description: "Please provide a name for your template",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'> = {
      name: templateName,
      description: templateDescription,
      defaultTaxRate: taxRate,
      defaultDueDateDays: dueDateDays,
      defaultItems: includeItems ? currentInvoice.items : [],
      defaultNotes: includeNotes ? currentInvoice.notes : ""
    };

    onSaveTemplate(newTemplate);
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setIncludeItems(true);
    setIncludeNotes(true);
    setDueDateDays(30);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a reusable template from this invoice to use for future invoices.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="HVAC Service Package"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="Standard template for HVAC maintenance services"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="due-date-days">Default Payment Terms (days)</Label>
            <Input
              id="due-date-days"
              type="number"
              min={1}
              max={90}
              value={dueDateDays}
              onChange={(e) => setDueDateDays(parseInt(e.target.value))}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="include-items" 
              checked={includeItems}
              onCheckedChange={(checked) => setIncludeItems(checked === true)}
            />
            <Label htmlFor="include-items">Include current invoice items ({currentInvoice.items.length})</Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="include-notes" 
              checked={includeNotes}
              onCheckedChange={(checked) => setIncludeNotes(checked === true)}
            />
            <Label htmlFor="include-notes">Include current invoice notes</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTemplate}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
