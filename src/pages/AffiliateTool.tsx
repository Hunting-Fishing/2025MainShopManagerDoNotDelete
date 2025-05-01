
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Hammer,
  Save,
  Upload,
  FolderTree
} from 'lucide-react';
import { 
  Container, 
  Header as SemanticHeader, 
  Segment, 
  Input, 
  Menu,
  Icon,
  Message
} from 'semantic-ui-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { ProductTier, AffiliateProduct, ToolCategory } from '@/types/affiliate';
import { addAffiliateTracking } from '@/utils/amazonUtils';
import ProductTierBadge from '@/components/affiliate/ProductTierBadge';
import ProductCard from '@/components/affiliate/ProductCard';
import CategoryGrid from '@/components/affiliate/CategoryGrid';
import SubmitProductForm from '@/components/affiliate/SubmitProductForm';

// Sample categories for demonstration
const sampleCategories: ToolCategory[] = [
  { id: '1', name: 'Hand Tools', description: 'Wrenches, screwdrivers, and other hand tools', slug: 'hand-tools' },
  { id: '2', name: 'Power Tools', description: 'Drills, saws, and other power tools', slug: 'power-tools' },
  { id: '3', name: 'Diagnostic Tools', description: 'OBD scanners and diagnostic equipment', slug: 'diagnostic' },
  { id: '4', name: 'Body Clips & Fasteners', description: 'Body clips, fasteners, and related accessories', slug: 'clips-fasteners' },
  { id: '5', name: 'Specialty Tools', description: 'Specialty automotive tools', slug: 'specialty' },
  { id: '6', name: 'Shop Equipment', description: 'Lifts, jacks, and other shop equipment', slug: 'shop-equipment' },
];

// Sample products for demonstration
const sampleProducts: AffiliateProduct[] = [
  {
    id: '1',
    name: 'Professional OBD2 Scanner',
    description: 'Professional automotive diagnostic scanner with advanced features',
    imageUrl: 'https://via.placeholder.com/300',
    tier: 'premium',
    category: 'diagnostic',
    retailPrice: 299.99,
    affiliateUrl: 'https://amazon.com/product/123',
    source: 'amazon',
    isFeatured: true
  },
  {
    id: '2',
    name: 'Mid-Range Socket Set',
    description: '40-piece socket set with ratchet handle',
    imageUrl: 'https://via.placeholder.com/300',
    tier: 'midgrade',
    category: 'hand-tools',
    retailPrice: 89.99,
    affiliateUrl: 'https://amazon.com/product/456',
    source: 'amazon'
  },
  {
    id: '3',
    name: 'Basic Cordless Drill',
    description: '12V cordless drill with battery and charger',
    imageUrl: 'https://via.placeholder.com/300',
    tier: 'economy',
    category: 'power-tools',
    retailPrice: 49.99,
    affiliateUrl: 'https://amazon.com/product/789',
    source: 'amazon'
  },
  {
    id: '4',
    name: 'Premium Body Clip Set',
    description: 'Comprehensive automotive body clip and fastener set',
    imageUrl: 'https://via.placeholder.com/300',
    tier: 'premium',
    category: 'clips-fasteners',
    retailPrice: 79.99,
    affiliateUrl: 'https://amazon.com/product/012',
    source: 'amazon',
    isSaved: true
  }
];

export default function AffiliateTool() {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedProducts, setSavedProducts] = useState<AffiliateProduct[]>(
    sampleProducts.filter(p => p.isSaved)
  );

  // Handle saving/unsaving products
  const toggleSaveProduct = (productId: string) => {
    setSavedProducts(prev => {
      const isAlreadySaved = prev.some(p => p.id === productId);
      
      if (isAlreadySaved) {
        return prev.filter(p => p.id !== productId);
      } else {
        const productToAdd = sampleProducts.find(p => p.id === productId);
        if (productToAdd) {
          return [...prev, {...productToAdd, isSaved: true}];
        }
      }
      return prev;
    });
  };

  // Filter products based on search query
  const filteredProducts = searchQuery 
    ? sampleProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleProducts;

  return (
    <Container fluid>
      <Segment raised className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 mb-6 border-l-4 border-blue-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <SemanticHeader as="h1" className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Professional Tool Shop
              <SemanticHeader.Subheader className="text-slate-600 dark:text-slate-300">
                Discover high-quality tools recommended by professionals. From diagnostic equipment to specialty tools - all with quality tiers to fit your budget.
              </SemanticHeader.Subheader>
            </SemanticHeader>
          </div>
        </div>
      </Segment>

      <div className="mb-6">
        <Input 
          fluid
          icon={<Icon name="search" />}
          placeholder="Search for tools, brands, or categories..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </div>

      <Segment>
        <Menu attached="top" tabular>
          <Menu.Item
            active={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
          >
            <Icon name="folder" /> Categories
          </Menu.Item>
          <Menu.Item
            active={activeTab === "saved"}
            onClick={() => setActiveTab("saved")}
          >
            <Icon name="heart" /> Saved Items
          </Menu.Item>
          <Menu.Item
            active={activeTab === "submit"}
            onClick={() => setActiveTab("submit")}
          >
            <Icon name="upload" /> Submit a Tool
          </Menu.Item>
        </Menu>

        <Segment attached="bottom" className="p-6">
          {activeTab === "categories" && (
            <div className="space-y-8">
              <CategoryGrid categories={sampleCategories} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <SemanticHeader as="h2" className="text-2xl font-semibold">Featured Tools</SemanticHeader>
                  <div className="flex items-center gap-2">
                    <ProductTierBadge tier="premium" />
                    <ProductTierBadge tier="midgrade" />
                    <ProductTierBadge tier="economy" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.filter(p => p.isFeatured).map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSaved={savedProducts.some(p => p.id === product.id)}
                      onSaveToggle={() => toggleSaveProduct(product.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <SemanticHeader as="h2" className="text-2xl font-semibold mb-4">All Tools</SemanticHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSaved={savedProducts.some(p => p.id === product.id)}
                      onSaveToggle={() => toggleSaveProduct(product.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <div>
              {savedProducts.length > 0 ? (
                <div>
                  <SemanticHeader as="h2" className="text-2xl font-semibold mb-6">Your Saved Items</SemanticHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSaved={true}
                        onSaveToggle={() => toggleSaveProduct(product.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Message info icon className="p-8 text-center">
                  <Icon name="heart outline" size="huge" className="mb-4" />
                  <Message.Content>
                    <Message.Header as="h3" className="text-2xl font-semibold mb-2">No saved items</Message.Header>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      You haven't saved any tools yet. Browse the categories and save items for later.
                    </p>
                    <Button onClick={() => setActiveTab("categories")}>Browse Tools</Button>
                  </Message.Content>
                </Message>
              )}
            </div>
          )}

          {activeTab === "submit" && (
            <SubmitProductForm />
          )}
        </Segment>
      </Segment>
    </Container>
  );
}
