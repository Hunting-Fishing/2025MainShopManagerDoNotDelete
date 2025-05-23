
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthUser } from '@/hooks/useAuthUser';
import { CustomerLoginRequiredWithImpersonation } from '@/components/customer-portal/CustomerLoginRequiredWithImpersonation';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function ClientBooking() {
  const { userId, isAuthenticated, isLoading } = useAuthUser();
  const [isBookingEnabled, setIsBookingEnabled] = useState<boolean | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  // Check booking permissions
  useEffect(() => {
    async function checkBookingPermissions() {
      if (!userId) {
        setCheckingPermissions(false);
        return;
      }
      
      try {
        // First check global shop setting
        const { data: shopSettings, error: shopError } = await supabase
          .from('shop_settings')
          .select('booking_enabled')
          .limit(1)
          .single();
        
        if (shopError) {
          console.error('Error fetching shop settings:', shopError);
          setBookingError('Could not check booking availability');
          setCheckingPermissions(false);
          return;
        }
        
        // If global booking is disabled, don't check individual permissions
        if (!shopSettings.booking_enabled) {
          setIsBookingEnabled(false);
          setCheckingPermissions(false);
          return;
        }
        
        // Check individual customer permission
        const { data: relationshipData, error: relationshipError } = await supabase
          .from('customer_shop_relationships')
          .select('booking_enabled')
          .eq('customer_id', userId)
          .limit(1)
          .single();
        
        if (relationshipError) {
          console.error('Error fetching customer permissions:', relationshipError);
          // Default to enabled if we can't find the relationship
          setIsBookingEnabled(true);
        } else {
          setIsBookingEnabled(relationshipData.booking_enabled);
        }
        
      } catch (err) {
        console.error('Error checking booking permissions:', err);
        setBookingError('Could not verify booking permissions');
      } finally {
        setCheckingPermissions(false);
      }
    }
    
    checkBookingPermissions();
  }, [userId]);

  // Show loading state
  if (isLoading || checkingPermissions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required if not authenticated
  if (!isAuthenticated) {
    return <CustomerLoginRequiredWithImpersonation />;
  }

  // Show error state
  if (bookingError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{bookingError}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show booking disabled message
  if (isBookingEnabled === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Booking Currently Unavailable
                </h2>
                <p className="text-gray-600">
                  Online booking is currently disabled for your account. 
                  Please contact us directly to schedule an appointment.
                </p>
                <div className="mt-6 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Call us at (555) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Email us at info@example.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show booking form if enabled
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Book an Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <BookingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookingForm() {
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    vehicle: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would implement the actual booking logic
      toast({
        title: "Booking Request Submitted",
        description: "We'll contact you shortly to confirm your appointment.",
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking request.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="service">Service Type</Label>
          <Select onValueChange={(value) => setFormData({...formData, service: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oil-change">Oil Change</SelectItem>
              <SelectItem value="brake-service">Brake Service</SelectItem>
              <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
              <SelectItem value="inspection">Vehicle Inspection</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicle">Vehicle</Label>
          <Input
            id="vehicle"
            placeholder="Year Make Model"
            value={formData.vehicle}
            onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="date">Preferred Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="time">Preferred Time</Label>
          <Select onValueChange={(value) => setFormData({...formData, time: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8:00">8:00 AM</SelectItem>
              <SelectItem value="9:00">9:00 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
              <SelectItem value="11:00">11:00 AM</SelectItem>
              <SelectItem value="1:00">1:00 PM</SelectItem>
              <SelectItem value="2:00">2:00 PM</SelectItem>
              <SelectItem value="3:00">3:00 PM</SelectItem>
              <SelectItem value="4:00">4:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about your service needs..."
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Submit Booking Request
      </Button>
    </form>
  );
}
