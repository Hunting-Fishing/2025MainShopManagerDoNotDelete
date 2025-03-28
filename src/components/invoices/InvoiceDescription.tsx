
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceDescriptionProps {
  description: string;
  notes: string;
  onDescriptionChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export function InvoiceDescription({
  description,
  notes,
  onDescriptionChange,
  onNotesChange,
}: InvoiceDescriptionProps) {
  return (
    <>
      <div className="mb-6">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter invoice description"
          rows={2}
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Enter any additional notes"
          rows={3}
        />
      </div>
    </>
  );
}
