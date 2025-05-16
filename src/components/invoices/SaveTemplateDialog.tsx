
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Invoice, InvoiceTemplate } from '@/types/invoice';

export interface SaveTemplateDialogProps {
  invoice: Invoice;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
  onClose: () => void;
}

export function SaveTemplateDialog({ invoice, onSaveTemplate, onClose }: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultNotes, setDefaultNotes] = useState(invoice.notes || '');
  const [defaultDueDateDays, setDefaultDueDateDays] = useState(30);
  const [defaultTaxRate, setDefaultTaxRate] = useState(8);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSaveTemplate({
      name,
      description,
      default_notes: defaultNotes,
      default_due_date_days: defaultDueDateDays,
      default_tax_rate: defaultTaxRate / 100,
      defaultNotes,
      defaultDueDateDays,
      defaultTaxRate: defaultTaxRate / 100,
      defaultItems: invoice.items || [],
      last_used: null,
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                step="0.01"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDateDays">Default Due In (Days)</Label>
              <Input
                id="dueDateDays"
                type="number"
                min="0"
                value={defaultDueDateDays}
                onChange={(e) => setDefaultDueDateDays(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultNotes">Default Notes</Label>
            <Textarea
              id="defaultNotes"
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
              placeholder="Default notes for invoices"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
