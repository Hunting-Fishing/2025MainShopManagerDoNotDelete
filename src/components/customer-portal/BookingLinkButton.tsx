
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function BookingLinkButton() {
  return (
    <Link to="/client-booking" className="block">
      <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100">
        <Calendar className="h-4 w-4 text-green-600" />
        <span className="text-green-700 font-medium">Book an Appointment</span>
      </Button>
    </Link>
  );
}
