import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Phone, 
  Star, 
  Search, 
  Calendar,
  Navigation,
  ExternalLink
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  services: string[];
  distance?: number;
  isOpen: boolean;
}

const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Elite Auto Service',
    description: 'Premium automotive service with certified technicians.',
    address: '123 Main Street',
    city: 'Downtown',
    phone: '(555) 123-4567',
    rating: 4.8,
    reviewCount: 245,
    specialties: ['BMW', 'Mercedes', 'Audi'],
    services: ['Oil Change', 'Brake Service', 'Engine Diagnostics'],
    distance: 2.3,
    isOpen: true,
  },
  {
    id: '2',
    name: 'QuickFix Auto Center',
    description: 'Fast, reliable automotive service for all makes and models.',
    address: '456 Oak Avenue',
    city: 'Midtown',
    phone: '(555) 987-6543',
    rating: 4.5,
    reviewCount: 189,
    specialties: ['Quick Service', 'Oil Changes', 'Inspections'],
    services: ['Oil Change', 'Tire Service', 'Battery', 'Inspection'],
    distance: 4.7,
    isOpen: true,
  }
];

export function ShopDirectory() {
  const [shops] = useState<Shop[]>(mockShops);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shop Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search shops or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-6">
            {filteredShops.map(shop => (
              <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{shop.name}</h3>
                      <p className="text-muted-foreground">{shop.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {renderStars(shop.rating)}
                        <span className="ml-1 font-medium">{shop.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shop.reviewCount} reviews
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {shop.address}, {shop.city}
                      {shop.distance && (
                        <Badge variant="outline">{shop.distance} mi</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      {shop.phone}
                      <Badge variant={shop.isOpen ? "default" : "secondary"}>
                        {shop.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Services</h4>
                      <div className="flex flex-wrap gap-1">
                        {shop.services.map(service => (
                          <Badge key={service} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {shop.specialties.map(specialty => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}