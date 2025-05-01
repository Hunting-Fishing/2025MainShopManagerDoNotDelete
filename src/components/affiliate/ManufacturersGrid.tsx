
import React, { useState } from 'react';
import { Segment, Header } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Manufacturer, ManufacturerCategory } from '@/types/affiliate';
import { Link } from 'react-router-dom';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Car, Truck, Ship, Tractor, Filter, Motorcycle, Anchor, Hammer, Wrench } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ManufacturersGridProps {
  manufacturers: Manufacturer[];
}

type CategoryFilter = ManufacturerCategory | 'all';

const ManufacturersGrid = ({ manufacturers }: ManufacturersGridProps) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  
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

  // Get category icon
  const getCategoryIcon = (category: ManufacturerCategory) => {
    switch (category) {
      case 'automotive':
        return <Car size={24} className="text-blue-600" />;
      case 'heavy-duty':
        return <Truck size={24} className="text-orange-600" />;
      case 'equipment':
        return <Tractor size={24} className="text-green-600" />;
      case 'marine':
        return <Anchor size={24} className="text-cyan-600" />;
      case 'atv-utv':
        return <Car size={24} className="text-purple-600" />;
      case 'motorcycle':
        return <Motorcycle size={24} className="text-red-600" />;
      default:
        return <Wrench size={24} className="text-gray-600" />;
    }
  };

  // Get badge color by category
  const getCategoryBadgeVariant = (category: ManufacturerCategory): string => {
    switch (category) {
      case 'automotive':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'heavy-duty':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'equipment':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'marine':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'atv-utv':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'motorcycle':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Filter manufacturers based on active category
  const filteredManufacturers = manufacturers.filter(manufacturer => {
    if (activeCategory === 'all') return true;
    return manufacturer.category === activeCategory;
  });

  // Get unique categories from manufacturers
  const categories = Array.from(new Set(manufacturers.map(m => m.category)));

  // Group manufacturers by category
  const groupedManufacturers = filteredManufacturers.reduce((acc, manufacturer) => {
    if (!acc[manufacturer.category]) {
      acc[manufacturer.category] = [];
    }
    acc[manufacturer.category].push(manufacturer);
    return acc;
  }, {} as Record<ManufacturerCategory, Manufacturer[]>);

  // Sort categories in a specific order
  const sortedCategories = [
    'automotive', 
    'heavy-duty', 
    'equipment', 
    'marine', 
    'atv-utv', 
    'motorcycle', 
    'other'
  ].filter(category => activeCategory === 'all' ? categories.includes(category as ManufacturerCategory) : category === activeCategory);

  // Get category display name
  const getCategoryDisplayName = (category: string): string => {
    switch (category) {
      case 'automotive': return 'Automotive';
      case 'heavy-duty': return 'Heavy-Duty Trucks';
      case 'equipment': return 'Equipment';
      case 'marine': return 'Marine';
      case 'atv-utv': return 'ATV / UTV';
      case 'motorcycle': return 'Motorcycle';
      case 'other': return 'Other';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <Segment className="mt-8 mb-8 bg-white p-6 rounded-lg">
      <Header as="h2" className="text-3xl font-bold mb-6 text-center">
        Vehicle Manufacturers By Category
      </Header>
      <p className="text-lg mb-6 text-center max-w-2xl mx-auto">
        Browse tools specifically designed for popular manufacturers across different vehicle categories.
        Select a manufacturer to find tools compatible with your vehicle.
      </p>
      
      {/* Category Filter Tabs */}
      <div className="flex justify-center mb-6">
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as CategoryFilter)}
          className="w-full max-w-3xl"
        >
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 overflow-x-auto">
            <TabsTrigger value="all" className="flex items-center gap-2 text-xs sm:text-sm">
              <Filter size={16} />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="automotive" className="flex items-center gap-2 text-xs sm:text-sm">
              <Car size={16} />
              <span>Automotive</span>
            </TabsTrigger>
            <TabsTrigger value="heavy-duty" className="flex items-center gap-2 text-xs sm:text-sm">
              <Truck size={16} />
              <span>Heavy-Duty</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2 text-xs sm:text-sm">
              <Tractor size={16} />
              <span>Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="marine" className="flex items-center gap-2 text-xs sm:text-sm">
              <Anchor size={16} />
              <span>Marine</span>
            </TabsTrigger>
            <TabsTrigger value="atv-utv" className="flex items-center gap-2 text-xs sm:text-sm">
              <Car size={16} />
              <span>ATV/UTV</span>
            </TabsTrigger>
            <TabsTrigger value="motorcycle" className="flex items-center gap-2 text-xs sm:text-sm">
              <Motorcycle size={16} />
              <span>Motorcycle</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeCategory === 'all' ? (
        // When displaying all categories, group by category
        <>
          {sortedCategories.map((category) => (
            <div key={category} className="mb-12">
              <div className="flex items-center mb-4">
                <div className="flex items-center bg-gradient-to-r from-gray-50 to-white p-2 rounded-lg shadow-sm">
                  {getCategoryIcon(category as ManufacturerCategory)}
                </div>
                <h3 className="text-2xl font-semibold ml-3">{getCategoryDisplayName(category)}</h3>
              </div>
              
              <ResponsiveGrid cols={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }} gap="md" className="mt-4">
                {groupedManufacturers[category as ManufacturerCategory]?.map(manufacturer => (
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
                            {getCategoryIcon(manufacturer.category)}
                          </div>
                        </div>
                        <h3 className="font-bold text-sm text-blue-700 line-clamp-1">{manufacturer.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${getCategoryBadgeVariant(manufacturer.category)}`}>
                          {getCategoryDisplayName(manufacturer.category)}
                        </span>
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
            </div>
          ))}
        </>
      ) : (
        // When filtered to a specific category, just show those manufacturers
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
                      {getCategoryIcon(manufacturer.category)}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-blue-700 line-clamp-1">{manufacturer.name}</h3>
                  {manufacturer.featured && (
                    <Badge variant="info" className="mt-1">Featured</Badge>
                  )}
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
      )}
    </Segment>
  );
};

export default ManufacturersGrid;
