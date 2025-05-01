
import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Grid, Icon } from 'semantic-ui-react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator, 
  Breadcrumb 
} from '@/components/ui/breadcrumb';
import { Star, ShoppingCart, Heart, Settings, Check, X, Share2 } from 'lucide-react';

interface ToolDetailParams {
  category?: string;
  toolId?: string;
}

const mockToolData = {
  id: 'example-tool-1',
  name: 'Professional OBD-II Scanner',
  category: 'Diagnostics',
  description: 'A high-quality OBD-II scanner for professional mechanics and DIY enthusiasts.',
  imageUrl: 'https://via.placeholder.com/600x400?text=OBD-II+Scanner',
  price: 189.99,
  rating: 4.8,
  reviewCount: 124,
  isFeatured: true,
  discount: 15,
  specifications: [
    { key: 'Connectivity', value: 'Bluetooth, Wi-Fi' },
    { key: 'Display', value: '5-inch LCD' },
    { key: 'Protocols', value: 'All OBD-II protocols' },
  ],
  reviews: [
    {
      id: 'review-1',
      userName: 'John Doe',
      rating: 5,
      comment: 'This scanner is amazing! It provides accurate and fast diagnostics.',
      createdAt: '2024-05-03',
    },
    {
      id: 'review-2',
      userName: 'Jane Smith',
      rating: 4,
      comment: 'Great tool, but the software could be more user-friendly.',
      createdAt: '2024-05-01',
    },
  ],
};

export default function ToolDetailPage() {
  const params = useParams<{ category?: string; toolId?: string }>();
  const { category, toolId } = params;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Mock: Fetch tool details based on category and toolId
    console.log(`Fetching details for tool ${toolId} in category ${category}`);
  }, [category, toolId]);

  if (!mockToolData) {
    return (
      <Container>
        <Segment placeholder>
          <Header icon>
            <Icon name="search" />
            Tool not found
          </Header>
          <Link to="/tools">Back to Tool Categories</Link>
        </Segment>
      </Container>
    );
  }

  return (
    <Container>
      <Segment>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/tools">Tool Categories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/tools/${category}`}>{category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            
            {mockToolData.name && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{mockToolData.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </Segment>

      <Grid stackable columns={2}>
        <Grid.Column width={8}>
          <Segment>
            <img src={mockToolData.imageUrl} alt={mockToolData.name} style={{ width: '100%' }} />
          </Segment>
        </Grid.Column>
        <Grid.Column width={8}>
          <Segment>
            <Header as="h2">{mockToolData.name}</Header>
            <p>{mockToolData.description}</p>
            <Badge variant="outline">{mockToolData.category}</Badge>
            <div className="flex items-center mt-2">
              <Star className="text-yellow-500 mr-1" size={16} fill="yellow" />
              <span>{mockToolData.rating} ({mockToolData.reviewCount} reviews)</span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold">${mockToolData.price}</span>
              {mockToolData.discount && (
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {mockToolData.discount}% OFF
                </Badge>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <ShoppingCart className="mr-2" size={16} /> Add to Cart
              </Button>
              <Button variant="outline" onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? (
                  <>
                    <Heart className="mr-2 text-red-500" size={16} fill="red" />
                    <span>Remove from Favorites</span>
                  </>
                ) : (
                  <>
                    <Heart className="mr-2" size={16} />
                    <span>Add to Favorites</span>
                  </>
                )}
              </Button>
              <Button variant="ghost">
                <Share2 className="mr-2" size={16} /> Share
              </Button>
            </div>
          </Segment>
        </Grid.Column>
      </Grid>

      <Segment>
        <Tabs defaultValue="specifications">
          <TabsList>
            <TabsTrigger value="specifications">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({mockToolData.reviews.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="specifications">
            <Grid columns={2} divided>
              {mockToolData.specifications.map((spec, index) => (
                <Grid.Row key={index}>
                  <Grid.Column>
                    <strong>{spec.key}</strong>
                  </Grid.Column>
                  <Grid.Column>{spec.value}</Grid.Column>
                </Grid.Row>
              ))}
            </Grid>
          </TabsContent>
          <TabsContent value="reviews">
            {mockToolData.reviews.map((review) => (
              <Card key={review.id} className="mb-4">
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Star className="text-yellow-500 mr-1" size={14} fill="yellow" />
                    <span>{review.rating}</span>
                    <span className="ml-2 text-gray-500">by {review.userName}</span>
                  </div>
                  <p>{review.comment}</p>
                  <div className="text-gray-500 text-sm mt-2">
                    Posted on {review.createdAt}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Segment>
    </Container>
  );
}
