
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { InvoiceTemplate } from "@/types/invoice";
import { v4 as uuidv4 } from 'uuid';

interface SaveTemplateDialogProps {
  invoice: any;
  onSaveTemplate: (template: InvoiceTemplate) => void;
}

export function SaveTemplateDialog({ invoice, onSaveTemplate }: SaveTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name) return;

    const template: InvoiceTemplate = {
      id: uuidv4(),
      name,
      description,
      date: new Date().toISOString(),
      items: invoice.items || [],
      customer: invoice.customer,
      customerEmail: invoice.customerEmail,
      customerAddress: invoice.customerAddress,
      notes: invoice.notes,
      description: invoice.description,
    };

    onSaveTemplate(template);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value);
      if (!value) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save as Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a reusable template from the current invoice. This will save the structure and items,
            but not customer-specific details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="template-name" className="mb-2 block">
              Template Name*
            </Label>
            <Input
              id="template-name"
              placeholder="Enter a name for this template"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="template-description" className="mb-2 block">
              Description
            </Label>
            <Textarea
              id="template-description"
              placeholder="Describe the purpose of this template"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
