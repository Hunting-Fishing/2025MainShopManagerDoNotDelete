
import React, { useState } from 'react';
import { Segment, Header } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Manufacturer } from '@/types/affiliate';
import { Link } from 'react-router-dom';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Car, Truck, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ManufacturersGridProps {
  manufacturers: Manufacturer[];
}

const ManufacturersGrid = ({ manufacturers }: ManufacturersGridProps) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'auto' | 'truck'>('all');
  
  // Logo fallback handler
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>, manufacturerName: string) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    
    // Try to get first letter for fallback
    const firstLetter = manufacturerName.charAt(0);
    target.parentElement?.classList.add('bg-blue-100');
    
    // Replace with a car icon instead of a placeholder image
    target.style.display = 'none';
    
    // Add car icon if it doesn't exist yet
    const iconContainer = target.parentElement;
    if (iconContainer && !iconContainer.querySelector('.fallback-icon')) {
      const icon = document.createElement('div');
      icon.className = 'fallback-icon flex items-center justify-center w-full h-full text-blue-600';
      icon.innerHTML = `<span class="font-bold text-lg">${firstLetter}</span>`;
      iconContainer.appendChild(icon);
    }
  };

  // Heavy-duty truck manufacturers IDs (16 and above in our data)
  const isTruckManufacturer = (manufacturer: Manufacturer) => {
    const truckManufacturerIds = ['16', '17', '18', '19', '20'];
    return truckManufacturerIds.includes(manufacturer.id);
  };

  // Filter manufacturers based on active category
  const filteredManufacturers = manufacturers.filter(manufacturer => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'auto') return !isTruckManufacturer(manufacturer);
    if (activeCategory === 'truck') return isTruckManufacturer(manufacturer);
    return true;
  });

  return (
    <Segment className="mt-8 mb-8 bg-white p-6 rounded-lg">
      <Header as="h2" className="text-3xl font-bold mb-6 text-center">
        Auto & Truck Manufacturers
      </Header>
      <p className="text-lg mb-6 text-center max-w-2xl mx-auto">
        Browse tools specifically designed for popular automotive and heavy-duty truck manufacturers.
        Select a manufacturer to find tools compatible with your vehicle.
      </p>
      
      {/* Category Filter Tabs */}
      <div className="flex justify-center mb-6">
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as 'all' | 'auto' | 'truck')}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Filter size={16} />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="auto" className="flex items-center gap-2">
              <Car size={16} />
              <span>Automotive</span>
            </TabsTrigger>
            <TabsTrigger value="truck" className="flex items-center gap-2">
              <Truck size={16} />
              <span>Heavy-Duty</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ResponsiveGrid cols={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }} gap="md" className="mt-6">
        {filteredManufacturers.map(manufacturer => (
          <Link key={manufacturer.id} to={`/manufacturers/${manufacturer.slug}`} className="group">
            <Card className="h-full hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-200 text-center">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-3 border border-gray-100 overflow-hidden shadow-sm relative">
                  {manufacturer.logoUrl && (
                    <img 
                      src={manufacturer.logoUrl} 
                      alt={manufacturer.name} 
                      className="max-h-12 max-w-12 object-contain z-10"
                      onError={(e) => handleLogoError(e, manufacturer.name)}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-100 z-0">
                    {isTruckManufacturer(manufacturer) ? (
                      <Truck size={24} className="text-blue-600" />
                    ) : (
                      <Car size={24} className="text-blue-600" />
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-blue-700 line-clamp-1">{manufacturer.name}</h3>
                <Button 
                  variant="outline" 
                  size="xs" 
                  className="mt-2 w-full rounded-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
                >
                  View Tools
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </ResponsiveGrid>
    </Segment>
  );
};

export default ManufacturersGrid;
