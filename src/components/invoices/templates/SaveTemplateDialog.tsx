
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceTemplate, Invoice } from "@/types/invoice";

interface SaveTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
  items: any[];
  defaultTaxRate: number;
  defaultNotes: string;
  invoice?: Invoice; // Add optional invoice property
}

export function SaveTemplateDialog({ 
  open, 
  onClose, 
  onSave, 
  items,
  defaultTaxRate,
  defaultNotes,
  invoice
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDays, setDueDays] = useState(30);
  
  const handleSave = () => {
    onSave({
      name,
      description,
      defaultTaxRate,
      defaultDueDateDays: dueDays,
      defaultNotes,
      defaultItems: items,
      lastUsed: null // Add the missing property
    });
    
    // Reset form
    setName("");
    setDescription("");
    setDueDays(30);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Oil Change"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is used for"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template-due-days">Default Due Days</Label>
            <Input
              id="template-due-days"
              type="number"
              min="1"
              max="90"
              value={dueDays}
              onChange={(e) => setDueDays(parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={!name}>Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
