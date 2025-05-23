
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookingRequestDto, 
  TimeSlot, 
  getAvailableTimeSlots, 
  createBookingRequest,
  checkBookingPermissions,
  getAvailableDates
} from '@/services/calendar/bookingService';
import { toast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/useAuthUser';
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { CustomerLoginRequiredWithImpersonation } from '@/components/customer-portal/CustomerLoginRequiredWithImpersonation';

export default function ClientBooking() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [isBookingPermitted, setIsBookingPermitted] = useState<boolean | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);
  
  const { userId } = useAuthUser();

  // Check booking permissions on load
  useEffect(() => {
    async function verifyBookingPermissions() {
      if (!userId) return;
      
      setIsCheckingPermissions(true);
      try {
        const permitted = await checkBookingPermissions(userId);
        setIsBookingPermitted(permitted);
      } catch (error) {
        console.error('Error checking booking permissions:', error);
        setIsBookingPermitted(false);
      } finally {
        setIsCheckingPermissions(false);
      }
    }
    
    verifyBookingPermissions();
  }, [userId]);

  // Load available dates for calendar
  useEffect(() => {
    async function loadAvailableDates() {
      if (!isBookingPermitted) return;
      setLoadingDates(true);
      
      try {
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // Looking 3 months ahead
        
        const availableDateStrings = await getAvailableDates(now, endDate);
        const parsedDates = availableDateStrings.map(dateStr => new Date(dateStr));
        setAvailableDates(parsedDates);
      } catch (error) {
        console.error('Error loading available dates:', error);
      } finally {
        setLoadingDates(false);
      }
    }
    
    if (isBookingPermitted) {
      loadAvailableDates();
    }
  }, [isBookingPermitted]);

  // When date changes, load available time slots
  useEffect(() => {
    async function loadTimeSlots() {
      if (!date) return;
      
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const slots = await getAvailableTimeSlots(formattedDate);
        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error('Error loading time slots:', error);
        setAvailableTimeSlots([]);
      }
    }
    
    loadTimeSlots();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedTimeSlot || !selectedServiceType || !userId) return;
    
    setIsSubmitting(true);
    
    try {
      const booking: BookingRequestDto = {
        customer_id: userId,
        technician_id: availableTimeSlots.find(slot => slot.time === selectedTimeSlot)?.technician_id || '',
        date: format(date, 'yyyy-MM-dd'),
        time_slot: selectedTimeSlot,
        service_type: selectedServiceType,
        notes: notes
      };
      
      const success = await createBookingRequest(booking);
      
      if (success) {
        toast({
          title: 'Booking Request Submitted',
          description: 'We have received your booking request and will contact you to confirm.',
        });
        
        // Reset form
        setDate(undefined);
        setSelectedTimeSlot('');
        setSelectedServiceType('');
        setNotes('');
      } else {
        toast({
          title: 'Booking Failed',
          description: 'Unable to complete your booking request. Please try again or contact us directly.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isCheckingPermissions) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg">Checking booking permissions...</span>
        </div>
      );
    }
    
    if (isBookingPermitted === false) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Unavailable</AlertTitle>
          <AlertDescription>
            Booking is currently disabled for your account. Please contact customer support for assistance.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
                <CardDescription>Choose a date for your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {loadingDates ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => {
                        // Disable dates in the past and any date that's not in availableDates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today || !availableDates.some(d => 
                          d.getFullYear() === date.getFullYear() && 
                          d.getMonth() === date.getMonth() && 
                          d.getDate() === date.getDate()
                        );
                      }}
                      className="rounded-md border"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Slots and Service */}
          <div className="space-y-6">
            {/* Time Slot Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Time</CardTitle>
                <CardDescription>Choose an available time slot</CardDescription>
              </CardHeader>
              <CardContent>
                {!date ? (
                  <div className="text-center p-4 text-slate-500">
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    Please select a date first
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="text-center p-4 text-slate-500">
                    No available time slots for this date
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableTimeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        type="button"
                        variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                        className={`${
                          selectedTimeSlot === slot.time ? "border-2 border-blue-600" : ""
                        }`}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                      >
                        {slot.time} {slot.technician && `- ${slot.technician}`}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Type</CardTitle>
                <CardDescription>Select the type of service you need</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil_change">Oil Change</SelectItem>
                    <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                    <SelectItem value="brake_service">Brake Service</SelectItem>
                    <SelectItem value="engine_diagnostic">Engine Diagnostic</SelectItem>
                    <SelectItem value="regular_maintenance">Regular Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
            <CardDescription>Please provide any additional details about your service needs</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any specific issues or requirements..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!date || !selectedTimeSlot || !selectedServiceType || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Request Appointment"
            )}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <CustomerLoginRequiredWithImpersonation>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Book an Appointment</h1>
            <p className="text-slate-600 mt-2">
              Select your preferred date and time for your service appointment
            </p>
          </div>
          
          {renderContent()}
        </div>
      </CustomerLoginRequiredWithImpersonation>
    </div>
  );
}
