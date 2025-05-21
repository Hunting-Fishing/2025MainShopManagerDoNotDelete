
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, addMonths, isSameMonth, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableDates, getAvailableTimeSlots, createBookingRequest, TimeSlot } from "@/services/calendar/bookingService";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";
import { Loader, CalendarIcon, Clock, Check } from "lucide-react";

export default function ClientBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Get the current month's range for fetching available dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Fetch customer ID when component mounts
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('customers')
            .select('id')
            .eq('auth_user_id', session.user.id)
            .single();
            
          if (data) {
            setCustomerId(data.id);
          }
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
      }
    };
    
    fetchCustomerData();
  }, []);

  // Load available dates for the selected month
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoading(true);
      try {
        const dates = await getAvailableDates(monthStart, monthEnd);
        setAvailableDates(dates);
      } catch (err) {
        console.error("Error loading available dates:", err);
        toast("Error loading calendar", {
          description: "Unable to load available appointment dates"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailableDates();
  }, [currentMonth]);

  // Load available time slots when a date is selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) return;
      
      setIsLoading(true);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const slots = await getAvailableTimeSlots(formattedDate);
        setTimeSlots(slots);
        setSelectedTimeSlot(null); // Reset selection
      } catch (err) {
        console.error("Error loading time slots:", err);
        toast("Error loading time slots", {
          description: "Unable to load available appointment times"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate]);

  // Handle date change
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!selectedTimeSlot || !selectedDate || !serviceType || !customerId) {
      toast("Missing information", {
        description: "Please select a date, time, and service type"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      const bookingData = {
        customer_id: customerId,
        technician_id: selectedTimeSlot.technician_id || "",
        date: formattedDate,
        time_slot: selectedTimeSlot.time,
        service_type: serviceType,
        notes: notes
      };
      
      const success = await createBookingRequest(bookingData);
      
      if (success) {
        toast("Booking Request Submitted", {
          description: "Your appointment request has been submitted and is pending approval"
        });
        navigate("/customer-portal", { replace: true });
      } else {
        toast("Booking Failed", {
          description: "There was an error submitting your appointment request"
        });
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      toast("Booking Error", {
        description: "There was a problem processing your request"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, redirect to customer portal (which has authentication checks)
  if (!customerId && !isLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="mb-4">You need to be signed in to book appointments</p>
        <Button onClick={() => navigate('/customer-portal')}>
          Go to Customer Portal
        </Button>
      </div>
    </div>;
  }

  return (
    <>
      <Helmet>
        <title>Book an Appointment</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Select a Date</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextMonth}>
                      Next
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(currentMonth, 'MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && !selectedDate ? (
                  <div className="flex items-center justify-center h-72">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    month={currentMonth}
                    className="rounded-md border"
                    disabled={(date) => {
                      // Disable dates in the past
                      if (date < new Date()) return true;
                      
                      // Disable dates not in available dates list
                      const dateStr = format(date, "yyyy-MM-dd");
                      return !availableDates.includes(dateStr);
                    }}
                    modifiers={{
                      available: (date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        return availableDates.includes(dateStr);
                      }
                    }}
                    modifiersStyles={{
                      available: {
                        backgroundColor: 'var(--green-50)'
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Time Slots & Booking Details Section */}
            <div className="space-y-6">
              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>Select a Time</CardTitle>
                  <CardDescription className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Available time slots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading && selectedDate ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !selectedDate ? (
                    <div className="text-center text-muted-foreground py-8">
                      Please select a date first
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No available time slots for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                          className="justify-between"
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          <span>{slot.time}</span>
                          {selectedTimeSlot?.id === slot.id && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="serviceType" className="block text-sm font-medium">
                      Service Type
                    </label>
                    <Select
                      value={serviceType}
                      onValueChange={setServiceType}
                    >
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil_change">Oil Change</SelectItem>
                        <SelectItem value="tune_up">Tune Up</SelectItem>
                        <SelectItem value="brake_service">Brake Service</SelectItem>
                        <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                        <SelectItem value="inspection">Vehicle Inspection</SelectItem>
                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                        <SelectItem value="other">Other Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium">
                      Notes (optional)
                    </label>
                    <Textarea
                      id="notes"
                      placeholder="Please provide any details about your appointment request"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handleSubmitBooking}
                    disabled={!selectedTimeSlot || !selectedDate || !serviceType || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Request Appointment"
                    )}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Your appointment will be pending until approved by our staff
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
