
import React, { useState } from "react";
import { Customer, CustomerNote } from "@/types/customer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface AddNoteDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded: (note: CustomerNote) => void;
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  customer,
  open,
  onOpenChange,
  onNoteAdded,
}) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"service" | "sales" | "follow-up" | "general">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real implementation, this would save to Supabase
      const newNote: CustomerNote = {
        id: uuidv4(),
        customer_id: customer.id,
        date: new Date().toISOString(),
        category,
        content,
        created_by: "Current User", // In a real app, this would be the logged-in user
        created_at: new Date().toISOString(),
      };
      
      // Call the callback to update the parent component's state
      onNoteAdded(newNote);
      
      toast({
        title: "Note added",
        description: "The note has been added successfully",
      });
      
      // Close the dialog and reset form
      onOpenChange(false);
      setContent("");
      setCategory("general");
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note for {customer.first_name} {customer.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger>
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
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
