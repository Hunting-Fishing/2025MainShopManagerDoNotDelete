
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCalendarEvent, getCalendarEvents } from "@/services/calendar/calendarEventService";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";

type FormData = {
  date: Date;
  time: string;
  serviceType: string;
  vehicleId: string;
  notes: string;
};

export function CustomerAppointmentBooking() {
  const { userId } = useAuthUser();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();

  // Get user's vehicles
  useState(() => {
    const fetchVehicles = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, year, make, model')
        .eq('customer_id', userId);
        
      if (!error && data) {
        setVehicles(data);
      }
    };
    
    fetchVehicles();
  });

  // When date changes, fetch available time slots
  const handleDateChange = async (newDate: Date | undefined) => {
    setDate(newDate);
    setValue("date", newDate as Date);
    
    if (newDate) {
      setIsLoading(true);
      try {
        // Format date as string for API call
        const dateStr = format(newDate, 'yyyy-MM-dd');
        
        // Get existing events for this date
        const events = await getCalendarEvents(dateStr, dateStr);
        
        // Generate available time slots (9am to 5pm, excluding booked slots)
        const bookedTimes = events.map(event => 
          new Date(event.start).getHours().toString().padStart(2, '0') + ":00"
        );
        
        const allSlots = [];
        for(let i = 9; i <= 17; i++) {
          const timeSlot = `${i.toString().padStart(2, '0')}:00`;
          if (!bookedTimes.includes(timeSlot)) {
            allSlots.push(timeSlot);
          }
        }
        
        setAvailableSlots(allSlots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available appointment slots",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Get the selected vehicle details
      const vehicle = vehicles.find(v => v.id === data.vehicleId);
      const vehicleDescription = vehicle 
        ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` 
        : "Vehicle not specified";
      
      // Format the appointment date/time
      const appointmentDate = format(data.date, 'yyyy-MM-dd');
      const startTime = `${appointmentDate}T${data.time}:00`;
      const endTime = `${appointmentDate}T${parseInt(data.time.split(':')[0]) + 1}:00:00`;

      // Create the appointment
      const eventData = {
        title: `${data.serviceType} Appointment`,
        description: data.notes || "Customer booked appointment",
        start_time: startTime,
        end_time: endTime,
        all_day: false,
        customer_id: userId,
        vehicle_id: data.vehicleId,
        event_type: 'appointment',
        status: 'pending',
        location: vehicleDescription
      };

      await createCalendarEvent(eventData);
      
      toast({
        title: "Appointment Booked",
        description: `Your appointment has been booked for ${format(data.date, 'MMMM d, yyyy')} at ${data.time}`,
      });
      
      // Reset form and go back to step 1
      setValue("date", undefined);
      setValue("time", "");
      setValue("serviceType", "");
      setValue("notes", "");
      setStep(1);
      
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Book an Appointment</h2>
        <p className="text-muted-foreground">
          Schedule a service appointment at a time that works for you.
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Select a Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 2))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {date && availableSlots.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="time">Select a Time</Label>
                  <Select onValueChange={(value) => setValue("time", value)}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {date && availableSlots.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                  No available appointment slots for this date. Please select another date.
                </div>
              )}

              <Button 
                onClick={() => setStep(2)} 
                disabled={!date || !watch("time")}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select 
                    onValueChange={(value) => setValue("serviceType", value)}
                    required
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oil Change">Oil Change</SelectItem>
                      <SelectItem value="Tire Rotation">Tire Rotation</SelectItem>
                      <SelectItem value="Brake Service">Brake Service</SelectItem>
                      <SelectItem value="Engine Diagnostic">Engine Diagnostic</SelectItem>
                      <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                      <SelectItem value="Other Service">Other Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="vehicleId">Vehicle</Label>
                  <Select 
                    onValueChange={(value) => setValue("vehicleId", value)}
                    required
                  >
                    <SelectTrigger id="vehicleId">
                      <SelectValue placeholder="Select your vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Please describe the issue or provide additional details about the service needed"
                    className="min-h-[100px]"
                    {...register("notes")}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
