
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { TimeSlot, getAvailableTimeSlots, createBookingRequest } from "@/services/calendar/bookingService";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface BookingDialogProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
}

export function BookingDialog({ date, isOpen, onClose, customerId }: BookingDialogProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const formattedDate = format(date, "yyyy-MM-dd");
  const displayDate = format(date, "MMMM d, yyyy");
  
  useEffect(() => {
    if (isOpen) {
      loadAvailableSlots();
    }
  }, [isOpen, date]);
  
  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const slots = await getAvailableTimeSlots(formattedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast({
        title: "Error",
        description: "Could not load available appointment slots.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    // Extract technician ID from the slot ID
    const selectedSlotData = availableSlots.find(slot => slot.id === slotId);
    if (selectedSlotData) {
      setSelectedTechnician(selectedSlotData.technician_id || null);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedSlot || !selectedTechnician) {
      toast({
        title: "Missing information",
        description: "Please select an available time slot.",
        variant: "destructive",
      });
      return;
    }
    
    if (!customerId) {
      toast({
        title: "Authentication required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get time from selected slot
      const selectedSlotData = availableSlots.find(slot => slot.id === selectedSlot);
      if (!selectedSlotData) throw new Error("Selected slot not found");
      
      const success = await createBookingRequest({
        customer_id: customerId,
        technician_id: selectedTechnician,
        date: formattedDate,
        time_slot: selectedSlotData.time,
        service_type: serviceType,
        notes: notes
      });
      
      if (success) {
        toast({
          title: "Booking request submitted",
          description: "Your appointment request has been sent.",
        });
        onClose();
        // Redirect to customer portal
        navigate("/customer-portal?tab=appointments");
      } else {
        throw new Error("Failed to submit booking");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking failed",
        description: "There was an error submitting your booking request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Select an available time slot for {displayDate}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-lg text-gray-500">No available slots for this date.</p>
            <p className="text-sm text-gray-400 mt-2">Please select another day or contact us directly.</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="timeSlot">Available Times</Label>
              <Select value={selectedSlot || ""} onValueChange={handleSlotSelect}>
                <SelectTrigger id="timeSlot">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.time} with {slot.technician}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Input
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Oil Change, Brake Replacement, etc."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please describe any specific concerns or requests"
                rows={3}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || availableSlots.length === 0 || !selectedSlot}
          >
            {isSubmitting ? "Submitting..." : "Book Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
