
import React, { useState } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CustomerAppointmentBooking() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  const { events, isLoading, error } = useCalendarEvents(currentDate, view);

  // Filter events to only show available appointment slots
  const availableSlots = events.filter(event => 
    event.type === 'appointment' && 
    event.status === 'available'
  );

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBookAppointment = (timeSlot: string) => {
    if (!selectedDate) return;

    // Here you would integrate with your booking system
    toast({
      title: "Booking Request Submitted",
      description: `Your request for ${format(selectedDate, 'MMMM d, yyyy')} at ${timeSlot} has been submitted. We'll contact you to confirm.`,
    });
    
    setSelectedDate(null);
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Unable to load appointment calendar. Please contact us directly to schedule your appointment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Schedule Your Appointment
          </CardTitle>
          <CardDescription className="text-blue-100">
            Select your preferred date and time for service
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Appointments</CardTitle>
          <CardDescription>
            Click on any date to see available time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView(viewType)}
                className="capitalize"
              >
                {viewType}
              </Button>
            ))}
          </div>

          {/* Enhanced Calendar View */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-blue-700">Loading available appointment slots...</p>
                </div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No appointment slots available</p>
                  <p className="text-sm text-gray-500">Please contact us directly to schedule your appointment</p>
                </div>
              </div>
            ) : (
              <CalendarView
                events={availableSlots}
                currentDate={currentDate}
                view={view}
                loading={false}
                onDateClick={handleDateClick}
                isCustomerView={true}
              />
            )}
          </div>

          {/* Booking Instructions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-800">Available Times</p>
                <p className="text-sm text-green-600">Green slots indicate available appointment times</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Select Time</p>
                <p className="text-sm text-blue-600">Click on your preferred time to book</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">Confirmation</p>
                <p className="text-sm text-purple-600">We'll contact you to confirm your booking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selection Modal */}
      {selectedDate && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Select Time for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  className="h-12 hover:bg-green-50 hover:border-green-300"
                  onClick={() => handleBookAppointment(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setSelectedDate(null)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
