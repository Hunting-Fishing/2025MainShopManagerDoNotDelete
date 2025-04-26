
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceDescriptionFieldProps {
  description: string;
  onChange: (description: string) => void;
}

export function InvoiceDescriptionField({ description, onChange }: InvoiceDescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none h-20"
        placeholder="Enter invoice description..."
      />
    </div>
  );
}
