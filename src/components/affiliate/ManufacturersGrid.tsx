
import React from 'react';
import { Grid, Segment, Header } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Manufacturer } from '@/types/affiliate';
import { Link } from 'react-router-dom';

interface ManufacturersGridProps {
  manufacturers: Manufacturer[];
}

const ManufacturersGrid = ({ manufacturers }: ManufacturersGridProps) => {
  return (
    <Segment className="mt-8 mb-8 bg-white p-6 rounded-lg">
      <Header as="h2" className="text-3xl font-bold mb-6 text-center">
        Automotive Manufacturers
      </Header>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        Browse tools specifically designed for popular automotive manufacturers.
        Select a manufacturer to find tools made for their vehicles.
      </p>
      
      <Grid columns={4} stackable doubling centered>
        {manufacturers.map(manufacturer => (
          <Grid.Column key={manufacturer.id} className="mb-6">
            <Link to={`/manufacturers/${manufacturer.slug}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 text-center">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mb-4 border border-gray-100 overflow-hidden">
                    <img 
                      src={manufacturer.logoUrl} 
                      alt={manufacturer.name} 
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-blue-700">{manufacturer.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{manufacturer.description}</p>
                  <Button variant="outline" className="mt-4 w-full rounded-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600">
                    View Tools
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default ManufacturersGrid;
