
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer, CustomerNote } from "@/types/customer";
import { addCustomerNote } from "@/services/customer/customerNotesService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";

interface AddNoteDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded?: (note: CustomerNote) => void;
}

export function AddNoteDialog({ customer, open, onOpenChange, onNoteAdded }: AddNoteDialogProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<'service' | 'sales' | 'follow-up' | 'general'>('general');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get the user's name or default to "System"
      const createdBy = user?.displayName || user?.email || "System";
      
      // Call the API to add the note
      const newNote = await addCustomerNote({
        customer_id: customer.id,
        content: content.trim(),
        category,
        created_by: createdBy
      });
      
      toast({
        title: "Note added",
        description: "Customer note has been added successfully",
      });
      
      // Close dialog and notify parent
      onOpenChange(false);
      if (onNoteAdded) onNoteAdded(newNote);
      
      // Reset form
      setContent("");
      setCategory('general');
    } catch (error) {
      console.error("Error adding customer note:", error);
      toast({
        title: "Error",
        description: "Failed to add customer note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note for {customer.first_name} {customer.last_name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="note-category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as 'service' | 'sales' | 'follow-up' | 'general')}
              >
                <SelectTrigger id="note-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="note-content" className="text-sm font-medium">
                Note Content
              </label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your note here..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
