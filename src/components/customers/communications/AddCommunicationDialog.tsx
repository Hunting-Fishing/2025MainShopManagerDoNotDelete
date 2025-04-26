
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer, CustomerCommunication } from "@/types/customer";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddCommunicationDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommunicationAdded: (communication: CustomerCommunication) => void;
}

export const AddCommunicationDialog: React.FC<AddCommunicationDialogProps> = ({
  customer,
  open,
  onOpenChange,
  onCommunicationAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("email");
  const [direction, setDirection] = useState<string>("outgoing");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter the communication content",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get current user info for staff details
      const staffMemberId = "current-user"; // In a real app, get this from auth context
      const staffMemberName = "Current User"; // In a real app, get this from auth context
      
      const newCommunication: Partial<CustomerCommunication> = {
        customer_id: customer.id,
        type: type as "email" | "phone" | "text" | "in-person",
        direction: direction as "incoming" | "outgoing",
        subject: subject || null,
        content,
        date: new Date().toISOString(),
        staff_member_id: staffMemberId,
        staff_member_name: staffMemberName,
        status: "completed"
      };
      
      const { data, error } = await supabase
        .from('customer_communications')
        .insert(newCommunication)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Communication recorded",
        description: "The communication has been saved successfully",
        variant: "success",
      });
      
      // Reset form
      setType("email");
      setDirection("outgoing");
      setSubject("");
      setContent("");
      
      // Close dialog and notify parent
      onOpenChange(false);
      onCommunicationAdded(data as CustomerCommunication);
      
    } catch (error) {
      console.error("Error saving communication:", error);
      toast({
        title: "Failed to save",
        description: "There was an error recording the communication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Communication</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {type === "email" && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter communication content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Communication"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
