
import React from 'react';
import { Grid, Segment, Header } from 'semantic-ui-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, ShoppingCart } from 'lucide-react';

interface Tool {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  bestSeller?: boolean;
}

interface BestSellingToolsProps {
  tools: Tool[];
}

const BestSellingTools = ({ tools }: BestSellingToolsProps) => {
  return (
    <Segment className="mt-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
      <Header as="h2" className="text-2xl font-semibold mb-4 flex items-center">
        <TrendingUp className="mr-2 text-green-600" />
        Best Selling Tools
      </Header>
      <Grid columns={4} stackable doubling>
        {tools.map(tool => (
          <Grid.Column key={tool.id}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-green-500">
              <CardContent className="p-0 relative">
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-100 text-green-800 border border-green-300">
                    Best Seller
                  </Badge>
                </div>
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-[180px] object-cover"
                />
                <div className="p-4">
                  <p className="font-medium mb-1">{tool.title}</p>
                  <Badge variant="outline" className="mb-2 text-xs">{tool.category}</Badge>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-blue-600 font-bold">${tool.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-600 flex items-center">
                      <Star size={14} className="text-yellow-500 mr-1 fill-yellow-500" /> {tool.rating} ({tool.reviewCount})
                    </span>
                  </div>
                  <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                    <ShoppingCart size={16} className="mr-1" /> View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default BestSellingTools;
