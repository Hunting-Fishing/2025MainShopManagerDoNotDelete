import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, addDays } from 'date-fns';
import { BookingAppointment, BookableService, useUpdateBookingAppointment, useCancelBookingAppointment } from '@/hooks/useBookingSystem';

interface BookingCalendarViewProps {
  appointments: BookingAppointment[];
  services: BookableService[];
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export function BookingCalendarView({ appointments, services }: BookingCalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<BookingAppointment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const updateAppointment = useUpdateBookingAppointment();
  const cancelAppointment = useCancelBookingAppointment();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.start_time), day) && apt.status !== 'cancelled'
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedAppointment) return;
    
    if (status === 'cancelled') {
      setShowCancelDialog(true);
      return;
    }

    await updateAppointment.mutateAsync({
      id: selectedAppointment.id,
      status: status as BookingAppointment['status'],
    });
    setSelectedAppointment(null);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;
    
    await cancelAppointment.mutateAsync({
      id: selectedAppointment.id,
      reason: cancelReason,
    });
    
    setShowCancelDialog(false);
    setCancelReason('');
    setSelectedAppointment(null);
  };

  const getServiceColor = (serviceId: string | null) => {
    const service = services.find(s => s.id === serviceId);
    return service?.color || '#3B82F6';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Booking Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="min-h-[200px]">
              <div className={`text-center p-2 rounded-t-lg font-medium ${
                isSameDay(day, new Date()) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <div className="text-xs">{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
              <div className="border border-t-0 rounded-b-lg p-1 space-y-1 min-h-[160px]">
                {getAppointmentsForDay(day).map((apt) => {
                  const StatusIcon = STATUS_CONFIG[apt.status].icon;
                  return (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="w-full text-left p-2 rounded text-xs hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: `${getServiceColor(apt.service_id)}20`,
                        borderLeft: `3px solid ${getServiceColor(apt.service_id)}`,
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">
                          {format(parseISO(apt.start_time), 'h:mm a')}
                        </span>
                      </div>
                      <div className="font-medium truncate">
                        {apt.customers?.first_name} {apt.customers?.last_name}
                      </div>
                      <div className="truncate text-muted-foreground">
                        {apt.bookable_services?.name}
                      </div>
                      <Badge variant="outline" className={`mt-1 text-[10px] ${STATUS_CONFIG[apt.status].color}`}>
                        <StatusIcon className="h-2 w-2 mr-1" />
                        {STATUS_CONFIG[apt.status].label}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment && !showCancelDialog} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-12 rounded"
                  style={{ backgroundColor: getServiceColor(selectedAppointment.service_id) }}
                />
                <div>
                  <h3 className="font-semibold">{selectedAppointment.bookable_services?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(selectedAppointment.start_time), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm">
                    {format(parseISO(selectedAppointment.start_time), 'h:mm a')} - {format(parseISO(selectedAppointment.end_time), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAppointment.customers?.first_name} {selectedAppointment.customers?.last_name}</span>
                </div>
                {selectedAppointment.customers?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedAppointment.customers.email}`} className="text-primary hover:underline">
                      {selectedAppointment.customers.email}
                    </a>
                  </div>
                )}
                {selectedAppointment.customers?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedAppointment.customers.phone}`} className="text-primary hover:underline">
                      {selectedAppointment.customers.phone}
                    </a>
                  </div>
                )}
              </div>

              {selectedAppointment.customer_notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-1">Customer Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.customer_notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <Select value={selectedAppointment.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Cancellation Reason (optional)</label>
              <Textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
