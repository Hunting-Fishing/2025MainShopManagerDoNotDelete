
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Car, Calendar, Edit, ArrowRight } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CustomerProfileCardProps {
  customer: Customer;
  view: 'grid' | 'list';
}

export function CustomerProfileCard({ customer, view }: CustomerProfileCardProps) {
  // Get customer initials for avatar
  const getInitials = () => {
    const first = customer.first_name?.charAt(0) || '';
    const last = customer.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  // Get a background color based on the customer name (for visual variety)
  const getAvatarColor = () => {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-indigo-600',
      'bg-pink-600',
      'bg-teal-600'
    ];
    
    // Simple hash function to determine color based on name
    const hash = (customer.first_name + customer.last_name).split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    
    return colors[hash % colors.length];
  };

  if (view === 'list') {
    return (
      <Card className="hover:shadow-md transition-all">
        <div className="flex items-center p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={cn("text-white", getAvatarColor())}>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="ml-4 flex-grow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{customer.first_name} {customer.last_name}</h3>
                {customer.company && (
                  <p className="text-sm text-muted-foreground">{customer.company}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {customer.tags && customer.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 border border-blue-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex mt-2 text-sm text-muted-foreground">
              {customer.email && (
                <div className="flex items-center mr-4">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>{customer.email}</span>
                </div>
              )}
              
              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/customers/${customer.id}`}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardHeader className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-900 pb-2">
        <div className="flex justify-between items-start">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarFallback className={cn("text-white text-xl rounded-xl", getAvatarColor())}>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-wrap gap-1 justify-end">
            {customer.tags && Array.isArray(customer.tags) && customer.tags.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 border border-blue-300">
                {tag}
              </Badge>
            ))}
            
            {customer.tags && Array.isArray(customer.tags) && customer.tags.length > 2 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border border-gray-300">
                +{customer.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="font-bold text-lg">{customer.first_name} {customer.last_name}</h3>
          {customer.company && (
            <p className="text-sm text-muted-foreground">{customer.company}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-2 text-sm">
          {customer.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          
          {customer.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="truncate">
                {customer.address}{customer.city && `, ${customer.city}`}
              </span>
            </div>
          )}
          
          {customer.vehicles && customer.vehicles.length > 0 && (
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{customer.vehicles.length} vehicle(s)</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/customers/${customer.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
        
        <Button variant="default" size="sm" asChild>
          <Link to={`/customers/${customer.id}`}>
            View Profile
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
