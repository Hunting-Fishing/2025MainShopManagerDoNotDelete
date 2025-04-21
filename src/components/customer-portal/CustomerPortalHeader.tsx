
import React from 'react';
import { Bell, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CustomerPortalHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="md:hidden">
          {/* Mobile menu button if needed */}
        </div>
        <h1 className="text-xl font-semibold md:text-2xl">Customer Portal</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-600"></span>
        </Button>
        <Button variant="ghost" size="icon">
          <Clock className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate('/customer-portal/profile')}>
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
