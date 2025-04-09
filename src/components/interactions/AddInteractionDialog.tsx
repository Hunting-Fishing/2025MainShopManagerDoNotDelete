
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Customer } from "@/types/customer";
import { CustomerInteraction, InteractionType, InteractionStatus } from "@/types/interaction";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addCustomerInteraction } from "@/services/customer/customerInteractionsService";

interface AddInteractionDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInteractionAdded: (interaction: CustomerInteraction) => void;
}

export const AddInteractionDialog: React.FC<AddInteractionDialogProps> = ({
  customer,
  open,
  onOpenChange,
  onInteractionAdded
}) => {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [type, setType] = useState<InteractionType>("communication");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [followUpDatePickerOpen, setFollowUpDatePickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get current user info - in a real app this would come from your auth context
      const staffMemberId = "current-user-id";
      const staffMemberName = "Current User";
      
      const newInteraction = {
        customerId: customer.id,
        customerName: customer.name || `${customer.first_name} ${customer.last_name}`,
        date: date.toISOString(),
        type,
        description,
        staffMemberId,
        staffMemberName,
        status: "completed" as InteractionStatus,
        notes,
        followUpDate: followUpRequired && followUpDate ? followUpDate.toISOString() : undefined,
        followUpCompleted: false
      };
      
      const savedInteraction = await addCustomerInteraction(newInteraction);
      
      if (savedInteraction) {
        toast({
          title: "Interaction recorded",
          description: "The customer interaction has been saved.",
        });
        
        onInteractionAdded(savedInteraction);
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error("Failed to save interaction");
      }
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast({
        title: "Error",
        description: "Failed to record the interaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setDescription("");
    setType("communication");
    setNotes("");
    setDate(new Date());
    setFollowUpDate(undefined);
    setFollowUpRequired(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Customer Interaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interaction-date">Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      date && setDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interaction-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as InteractionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="work_order">Work Order</SelectItem>
                  <SelectItem value="parts">Parts</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interaction-description">Description</Label>
            <Input
              id="interaction-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the interaction"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interaction-notes">Notes</Label>
            <Textarea
              id="interaction-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or details"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="follow-up-required"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
              />
              <Label htmlFor="follow-up-required">Follow-up required?</Label>
            </div>
            
            {followUpRequired && (
              <div className="pt-2">
                <Label htmlFor="follow-up-date">Follow-up Date</Label>
                <Popover open={followUpDatePickerOpen} onOpenChange={setFollowUpDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !followUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate ? format(followUpDate, "PPP") : <span>Pick a follow-up date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={(date) => {
                        setFollowUpDate(date);
                        setFollowUpDatePickerOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !description}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Interaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
