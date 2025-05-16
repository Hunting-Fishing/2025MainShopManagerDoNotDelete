
import React from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, MapPin, Mail, Phone, Tag, MoreHorizontal, Heart, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

interface CustomerProfileCardProps {
  customer: Customer;
  view: 'grid' | 'list';
}

export function CustomerProfileCard({ customer, view }: CustomerProfileCardProps) {
  // Generate initials from customer name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Format date to readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Get the component styling based on the view
  const cardClass = view === 'grid' ? '' : 'flex flex-row';
  const contentClass = view === 'grid' ? '' : 'flex-1';
  
  // Get color for loyalty tier
  const getLoyaltyColor = (tier?: string) => {
    switch(tier?.toLowerCase()) {
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <Card className={`overflow-hidden ${cardClass} hover:shadow-md transition-shadow`}>
      {view === 'grid' && (
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
          {customer.loyalty && (
            <Badge className={`absolute top-3 right-3 border ${getLoyaltyColor(customer.loyalty.tier)}`}>
              <Heart className="h-3 w-3 mr-1" /> {customer.loyalty.tier}
            </Badge>
          )}
        </div>
      )}
      
      <div className={contentClass}>
        <CardHeader className={view === 'grid' ? '-mt-12 flex-col items-start' : 'py-3'}>
          <div className="flex items-center w-full">
            <Avatar className={`h-14 w-14 border-4 border-white shadow-md ${
              view === 'list' ? 'mr-4' : 'mb-2'
            }`}>
              <AvatarFallback className="bg-purple-600 text-white">
                {getInitials(`${customer.first_name} ${customer.last_name}`)}
              </AvatarFallback>
            </Avatar>
            
            {view === 'list' && (
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.first_name} {customer.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  {customer.loyalty && (
                    <Badge className={`border ${getLoyaltyColor(customer.loyalty.tier)}`}>
                      <Heart className="h-3 w-3 mr-1" /> {customer.loyalty.tier}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={view === 'grid' ? 'end' : 'end'}>
                  <DropdownMenuItem asChild>
                    <Link to={`/customers/${customer.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/customers/${customer.id}/edit`}>Edit Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/work-orders/new?customer=${customer.id}`}>Create Work Order</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/invoices/new?customer=${customer.id}`}>Create Invoice</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Delete Profile</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {view === 'grid' && (
            <>
              <h3 className="font-semibold text-lg mt-2">{customer.first_name} {customer.last_name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {customer.company && (
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{customer.company}</span>
              </div>
            )}
            
            {customer.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
            
            {customer.address && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <span className="text-sm">
                  {customer.address}
                  {customer.city && `, ${customer.city}`}
                  {customer.state && `, ${customer.state}`}
                </span>
              </div>
            )}
            
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Customer since {formatDate(customer.created_at)}</span>
            </div>
            
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {customer.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center text-xs px-2 py-0.5">
                    <Tag className="h-2.5 w-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {customer.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{customer.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </div>

      {view === 'grid' && (
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/customers/${customer.id}`}>View Profile</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={`/customers/${customer.id}/edit`}>Edit</Link>
          </Button>
        </CardFooter>
      )}
      
      {view === 'list' && (
        <div className="flex items-center gap-2 p-4 border-l">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/customers/${customer.id}`}>View</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={`/customers/${customer.id}/edit`}>Edit</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
