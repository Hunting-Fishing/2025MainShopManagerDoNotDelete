
import React from 'react';
import { Segment, Header } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Manufacturer } from '@/types/affiliate';
import { Link } from 'react-router-dom';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Car } from 'lucide-react';

interface ManufacturersGridProps {
  manufacturers: Manufacturer[];
}

const ManufacturersGrid = ({ manufacturers }: ManufacturersGridProps) => {
  return (
    <Segment className="mt-8 mb-8 bg-white p-6 rounded-lg">
      <Header as="h2" className="text-3xl font-bold mb-6 text-center">
        Auto Manufacturers
      </Header>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        Browse tools specifically designed for popular automotive manufacturers.
        Select a manufacturer to find tools compatible with your vehicle.
      </p>
      
      <ResponsiveGrid cols={{ default: 2, sm: 3, md: 4, lg: 5, xl: 6 }} gap="md" className="mt-6">
        {manufacturers.map(manufacturer => (
          <Link key={manufacturer.id} to={`/manufacturers/${manufacturer.slug}`} className="group">
            <Card className="h-full hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-200 text-center">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-3 border border-gray-100 overflow-hidden shadow-sm">
                  {manufacturer.logoUrl ? (
                    <img 
                      src={manufacturer.logoUrl} 
                      alt={manufacturer.name} 
                      className="max-h-12 max-w-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://via.placeholder.com/150?text=' + manufacturer.name.charAt(0);
                      }}
                    />
                  ) : (
                    <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600">
                      <Car size={24} />
                    </div>
                  )}
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
