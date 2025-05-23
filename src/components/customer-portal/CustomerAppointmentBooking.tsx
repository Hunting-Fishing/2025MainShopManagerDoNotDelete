
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarViewType } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function CustomerAppointmentBooking() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('day');
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
    // Switch to day view when a date is clicked from month/week view
    if (view !== 'day') {
      setView('day');
      setCurrentDate(date);
    }
  };

  const handleBookAppointment = (date: Date, timeSlot?: string) => {
    if (!date) return;
    
    const appointmentTime = timeSlot 
      ? `${format(date, 'MMMM d, yyyy')} at ${timeSlot}`
      : format(date, 'MMMM d, yyyy');
    
    toast({
      title: "Appointment Request Submitted",
      description: `Your request for ${appointmentTime} has been submitted. We'll contact you to confirm.`,
    });
    
    setSelectedDate(null);
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Unable to load appointment calendar. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Book an Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Calendar Header with View Controls */}
          <div className="mb-6">
            <CalendarHeader
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              view={view}
              setView={setView}
            />
          </div>

          {/* Enhanced Calendar View */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <CalendarView
              events={availableSlots}
              currentDate={currentDate}
              view={view}
              loading={isLoading}
              onDateClick={handleDateClick}
              isCustomerView={true}
            />
          </div>

          {/* Booking Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">How to Book:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use the view controls above to switch between Day, Week, and Month views</li>
              <li>• Click on any date to see available time slots</li>
              <li>• <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>Green slots indicate available appointment times</li>
              <li>• Select your preferred time to submit a booking request</li>
            </ul>
          </div>

          {/* Selected Date Booking Panel */}
          {selectedDate && view === 'day' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">
                Available Times for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    className="bg-green-500 border-green-600 text-white hover:bg-green-600 transition-colors font-medium"
                    onClick={() => handleBookAppointment(selectedDate, time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-gray-500"
                onClick={() => setSelectedDate(null)}
              >
                Cancel Selection
              </Button>
            </div>
          )}

          {/* Quick Day Navigation for Day View */}
          {view === 'day' && (
            <div className="mt-4 flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
              >
                Previous Day
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
              >
                Next Day
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Need help?</strong> Contact us at (555) 123-4567 or email support@yourshop.com
            </p>
            <p>
              Appointments are subject to confirmation. We'll contact you within 24 hours to confirm your booking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
