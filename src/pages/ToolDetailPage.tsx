
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Header as SemanticHeader, Segment, Breadcrumb, Icon, Button, Grid, Label, Divider } from 'semantic-ui-react';
import { Badge } from "@/components/ui/badge";

export default function ToolDetailPage() {
  const { category, toolId } = useParams<{ category: string; toolId: string }>();
  
  // In a real app, we would fetch the tool details based on toolId
  // For now, we'll create a mock tool based on the URL parameters
  const tool = {
    id: toolId,
    title: toolId?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
    category: category?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
    description: "Professional-grade tool designed for automotive repair and maintenance. Features durable construction, ergonomic design, and precision engineering.",
    features: [
      "Durable high-carbon steel construction",
      "Ergonomic non-slip grip handle",
      "Lifetime warranty against manufacturing defects",
      "Meets or exceeds ANSI specifications",
      "Professional-grade quality"
    ],
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.7,
    reviewCount: 42,
    inStock: true,
    img: `https://via.placeholder.com/600x400?text=${encodeURIComponent(toolId || 'Tool')}`,
    relatedProducts: Array.from({ length: 4 }, (_, i) => ({
      id: `related-${i + 1}`,
      title: `Related Tool ${i + 1}`,
      img: `https://via.placeholder.com/150x100?text=Related+${i+1}`,
      price: (49.99 + i * 10).toFixed(2)
    }))
  };

  return (
    <Container fluid>
      <Segment raised className="mb-6">
        <Breadcrumb size='large'>
          <Breadcrumb.Section link as={Link} to="/tools">Tool Categories</Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section link as={Link} to={`/tools/${category}`}>{tool.category}</Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{tool.title}</Breadcrumb.Section>
        </Breadcrumb>
      </Segment>

      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={8}>
            <img
              src={tool.img}
              alt={tool.title}
              className="w-full h-auto object-cover rounded-lg border border-gray-200"
            />
          </Grid.Column>
          <Grid.Column width={8}>
            <div className="p-4">
              <SemanticHeader as="h1" className="text-3xl font-bold mb-2">
                {tool.title}
              </SemanticHeader>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon 
                      key={i} 
                      name="star" 
                      color={i < Math.floor(tool.rating) ? 'yellow' : 'grey'} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({tool.reviewCount} reviews)</span>
                <Badge variant="outline" className="ml-2">Professional Grade</Badge>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">${tool.price}</span>
                {tool.originalPrice > tool.price && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ${tool.originalPrice}
                  </span>
                )}
              </div>
              
              <Label color={tool.inStock ? 'green' : 'red'} ribbon>
                {tool.inStock ? 'In Stock' : 'Out of Stock'}
              </Label>
              
              <p className="my-4 text-gray-700">{tool.description}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {tool.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button primary size="large" icon labelPosition="left">
                  <Icon name="cart" />
                  Add to Cart
                </Button>
                <Button secondary size="large" icon labelPosition="left">
                  <Icon name="heart" />
                  Save for Later
                </Button>
              </div>
            </div>
          </Grid.Column>
        </Grid.Row>
        
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <SemanticHeader as="h3">Related Tools</SemanticHeader>
              <Divider />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tool.relatedProducts.map(product => (
                  <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <img 
                      src={product.img} 
                      alt={product.title} 
                      className="w-full h-24 object-cover mb-2 rounded"
                    />
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-blue-600 font-bold">${product.price}</p>
                  </div>
                ))}
              </div>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}
