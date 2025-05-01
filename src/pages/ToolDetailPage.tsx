
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Header as SemanticHeader, Segment, Breadcrumb, Icon, Grid, Label, Divider } from 'semantic-ui-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Heart, Info, ShoppingCart, Star, Tool, Truck } from "lucide-react";
import { toast } from "sonner";

export default function ToolDetailPage() {
  const { category, toolId } = useParams<{ category: string; toolId: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specifications");
  
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
    specifications: {
      "Material": "High-carbon steel with chrome plating",
      "Handle": "Ergonomic rubber grip",
      "Weight": "1.2 lbs (0.54 kg)",
      "Dimensions": "10.5\" x 3.2\" x 1.1\"",
      "Warranty": "Lifetime against manufacturing defects",
      "Origin": "USA",
      "Certification": "ANSI Certified"
    },
    price: 89.99,
    originalPrice: 129.99,
    discount: 30,
    rating: 4.7,
    reviewCount: 42,
    inStock: true,
    stockQuantity: 24,
    freeShipping: true,
    images: [
      `https://via.placeholder.com/600x400?text=${encodeURIComponent(toolId || 'Tool')}`,
      `https://via.placeholder.com/600x400?text=${encodeURIComponent(toolId || 'Tool')}+Side`,
      `https://via.placeholder.com/600x400?text=${encodeURIComponent(toolId || 'Tool')}+Top`,
    ],
    relatedProducts: Array.from({ length: 4 }, (_, i) => ({
      id: `related-${i + 1}`,
      title: `Related Tool ${i + 1}`,
      img: `https://via.placeholder.com/150x100?text=Related+${i+1}`,
      price: (49.99 + i * 10).toFixed(2),
      rating: (3.5 + Math.random()).toFixed(1)
    }))
  };

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${tool.title} to cart!`, {
      description: `$${(tool.price * quantity).toFixed(2)} added to your cart`,
      action: {
        label: "View Cart",
        onClick: () => console.log("View cart clicked"),
      },
    });
  };

  const handleSaveForLater = () => {
    toast.success(`${tool.title} saved for later!`, {
      description: "You can find this item in your saved items",
    });
  };

  return (
    <Container fluid>
      {/* Enhanced Breadcrumb with gradient background */}
      <Segment raised className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-4 mb-6 border-l-4 border-blue-500">
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
          {/* Left Column - Images */}
          <Grid.Column width={8}>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={tool.images[selectedImage]}
                  alt={tool.title}
                  className="w-full h-auto object-cover rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-2 justify-center">
                {tool.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded cursor-pointer transition-all ${
                      selectedImage === idx 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img
                      src={img}
                      alt={`${tool.title} view ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Grid.Column>
          
          {/* Right Column - Product Info */}
          <Grid.Column width={8}>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border border-blue-200">Professional Grade</Badge>
                {tool.freeShipping && (
                  <Badge variant="outline" className="bg-green-50 text-green-800 border border-green-200 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Free Shipping
                  </Badge>
                )}
              </div>
              
              <SemanticHeader as="h1" className="text-3xl font-bold mb-2">
                {tool.title}
              </SemanticHeader>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={i < Math.floor(tool.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                      size={18} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({tool.reviewCount} reviews)</span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">${tool.price}</span>
                {tool.originalPrice > tool.price && (
                  <>
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      ${tool.originalPrice}
                    </span>
                    <Badge className="ml-2 bg-red-100 text-red-800 border border-red-300">
                      {tool.discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
              
              <div className="mb-6">
                <Badge className={tool.inStock ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"}>
                  {tool.inStock ? `In Stock (${tool.stockQuantity} available)` : 'Out of Stock'}
                </Badge>
                
                <Badge className="ml-2 bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                  <Icon name="certificate" /> Quality Guaranteed
                </Badge>
              </div>
              
              <p className="my-4 text-gray-700 leading-relaxed">{tool.description}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Check className="mr-2 text-green-600" size={18} />
                  Key Features
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {tool.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <Divider />
              
              <div className="flex items-center gap-3 my-4">
                <div className="flex border border-gray-300 rounded">
                  <button 
                    className="px-3 py-1 border-r border-gray-300 bg-gray-100 hover:bg-gray-200" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 flex items-center justify-center">{quantity}</span>
                  <button 
                    className="px-3 py-1 border-l border-gray-300 bg-gray-100 hover:bg-gray-200" 
                    onClick={() => setQuantity(Math.min(tool.stockQuantity, quantity + 1))}
                    disabled={quantity >= tool.stockQuantity}
                  >
                    +
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3 flex-1">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2" size={18} />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleSaveForLater}
                  >
                    <Heart className="mr-2" size={18} />
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          </Grid.Column>
        </Grid.Row>
        
        {/* Product Details Tabs */}
        <Grid.Row>
          <Grid.Column width={16}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="w-full border-b bg-transparent">
                <TabsTrigger value="specifications" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                  <Tool className="mr-2" size={16} />
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                  <Star className="mr-2" size={16} />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="warranty" className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                  <Info className="mr-2" size={16} />
                  Warranty
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specifications" className="border rounded-md p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(tool.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="border rounded-md p-4 mt-4">
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <div className="text-4xl font-bold text-gray-800 mr-2">{tool.rating}</div>
                    <div className="flex flex-col">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={i < Math.floor(tool.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                            size={16} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{tool.reviewCount} reviews</div>
                    </div>
                  </div>
                  <Button variant="outline" className="ml-auto text-sm">Write a Review</Button>
                </div>
                <p className="text-gray-500 italic text-center my-8">Review content would display here in a real application.</p>
              </TabsContent>
              <TabsContent value="warranty" className="border rounded-md p-4 mt-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">Lifetime Warranty</h3>
                  <p className="text-blue-700">This product comes with our comprehensive lifetime warranty against manufacturing defects.</p>
                </div>
                <h4 className="font-semibold text-gray-800 mt-4">Warranty Coverage:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>Manufacturing defects in materials and workmanship</li>
                  <li>Free repair or replacement of defective parts</li>
                  <li>Coverage for original purchaser only</li>
                </ul>
                <h4 className="font-semibold text-gray-800 mt-4">Warranty Exclusions:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                  <li>Normal wear and tear</li>
                  <li>Improper use or misuse of the tool</li>
                  <li>Unauthorized modifications or repairs</li>
                </ul>
              </TabsContent>
            </Tabs>
          </Grid.Column>
        </Grid.Row>
        
        {/* Related Tools Section */}
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <SemanticHeader as="h3" className="font-semibold text-xl mb-4 flex items-center">
                <Icon name="linkify" className="mr-2" />
                Related Tools
              </SemanticHeader>
              <Divider />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tool.relatedProducts.map(product => (
                  <Card key={product.id} className="border rounded-lg hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <img 
                        src={product.img} 
                        alt={product.title} 
                        className="w-full h-24 object-cover mb-2 rounded"
                      />
                      <p className="font-medium text-sm">{product.title}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-blue-600 font-bold">${product.price}</p>
                        <div className="flex items-center text-sm">
                          <Star className="fill-yellow-400 text-yellow-400 mr-1" size={12} />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">View Details</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}
