
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
        Shop by Manufacturer
      </Header>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        Browse tools from the most trusted manufacturers in the automotive industry.
        Click on a manufacturer to see their complete product line.
      </p>
      
      <Grid columns={5} stackable doubling centered>
        {manufacturers.map(manufacturer => (
          <Grid.Column key={manufacturer.id}>
            <Link to={`/manufacturers/${manufacturer.slug}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 text-center">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="bg-gray-50 p-4 rounded-lg w-full flex items-center justify-center h-24 mb-3">
                    <img 
                      src={manufacturer.logoUrl} 
                      alt={manufacturer.name} 
                      className="max-h-20 max-w-full"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{manufacturer.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{manufacturer.description}</p>
                  <Button variant="outline" className="mt-4 w-full">
                    View Products
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
