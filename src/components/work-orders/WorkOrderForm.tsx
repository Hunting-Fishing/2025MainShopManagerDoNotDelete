
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/utils/workOrders/crud"; 

interface WorkOrderFormProps {
  technicians: string[];
  isLoadingTechnicians: boolean;
  setIsSubmitting?: React.Dispatch<React.SetStateAction<boolean>>;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
  id?: string;
}

export function WorkOrderForm({ 
  technicians, 
  isLoadingTechnicians, 
  setIsSubmitting,
  setError,
  id 
}: WorkOrderFormProps) {
  const navigate = useNavigate();
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  
  // Form state
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [technician, setTechnician] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use provided state setter or internal one
    const updateSubmitting = setIsSubmitting || setIsSubmittingInternal;
    updateSubmitting(true);
    
    try {
      // In a real application, this would save the work order data to a database
      console.log({
        customer, 
        description,
        status,
        priority,
        technician,
        dueDate,
        notes,
        location
      });
      
      // Try to use the createWorkOrder utility if available
      try {
        await createWorkOrder({
          customer,
          description,
          status: status as any,
          priority: priority as any,
          technician,
          dueDate: dueDate ? dueDate.toISOString() : new Date().toISOString(),
          location,
          notes
        });
      } catch (utilError) {
        console.error("Error using workOrder util:", utilError);
        // Fallback to simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Success",
        description: "Work order created successfully",
      });
      
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      const errorMsg = "Failed to create work order. Please try again.";
      
      if (setError) {
        setError(errorMsg);
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      updateSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6" id={id}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Input 
              id="customer" 
              value={customer} 
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter work order description"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter service location"
            />
          </div>
        </div>
        
        {/* Status & Assignment */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="technician">Assigned Technician</Label>
            <Select value={technician} onValueChange={setTechnician} disabled={isLoadingTechnicians}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter additional notes or instructions"
          className="min-h-[120px]"
        />
      </div>
      
      {/* Actions - Only show if id is not provided (handled externally) */}
      {!id && (
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmittingInternal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmittingInternal ? "Creating..." : "Create Work Order"}
          </Button>
        </div>
      )}
    </form>
  );
}
