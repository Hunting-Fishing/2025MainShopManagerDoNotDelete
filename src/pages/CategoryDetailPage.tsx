
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, ChevronLeft } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/shopping';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicleData } from '@/hooks/useVehicleData';

// This is a mapping of URL slugs to display names
const CATEGORY_MAP: Record<string, string> = {
  'safety-gear': 'Safety Gear',
  'lifting-equipment': 'Lifting Equipment',
  'hand-tools': 'Hand Tools',
  'cleaning-supplies': 'Cleaning Supplies',
  'lighting': 'Lighting',
  'oil-changes': 'Oil Changes',
  'brake-repair': 'Brake Repair',
  'fuel-service': 'Fuel Service',
  'tires': 'Tires',
  'air-conditioning-service': 'Air Conditioning Service',
  'transmission-services': 'Transmission Services',
  'engine-repairs': 'Engine Repairs',
  'belts-and-cooling-system': 'Belts and Cooling System',
  'steering-suspension': 'Steering & Suspension',
  'battery-charging-replacement': 'Battery Charging & Replacement',
  'starting-charging-system': 'Starting & Charging System Diagnosis',
  'vehicle-diagnostics': 'Vehicle Diagnostics'
};

// This represents our subcategories for tools
const SUBCATEGORIES: Record<string, string[]> = {
  'safety-gear': ['Eye Protection', 'Hand Protection', 'Respiratory Protection'],
  'lifting-equipment': ['Jacks', 'Stands', 'Ramps', 'Wheel Chocks'],
  'hand-tools': ['Socket Sets', 'Wrenches', 'Screwdrivers', 'Pliers', 'Hammers'],
  'brake-repair': ['Disc Brake Tools', 'Drum Brake Tools', 'Bleeding Tools'],
  'fuel-service': ['Fuel Line Tools', 'Testing Equipment', 'Injector Tools'],
  'cleaning-supplies': ['General Cleaners', 'Brake Cleaners', 'Degreasers', 'Microfiber Towels'],
  'lighting': ['Work Lights', 'Flashlights', 'Inspection Lights', 'Drop Lights'],
  // Add more as needed
};

const CategoryDetailPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { products, isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { makes, models, years, selectedMake, selectedModel, selectedYear, setSelectedModel, setSelectedYear, fetchModels } = useVehicleData();
  
  const categoryName = categorySlug ? CATEGORY_MAP[categorySlug] || categorySlug.replace(/-/g, ' ') : 'Category';
  const subcategories = categorySlug ? SUBCATEGORIES[categorySlug] || [] : [];
  
  // Track if vehicle filters have been applied
  const [vehicleFiltersApplied, setVehicleFiltersApplied] = useState(false);

  // Handle make selection
  const handleMakeChange = async (make: string) => {
    if (make) {
      await fetchModels(make);
      setSelectedYear('');
      setSelectedModel('');
      applyFilters(make, '', '');
    }
  };

  // Handle model selection
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    applyFilters(selectedMake, model, selectedYear);
  };

  // Handle year selection
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    applyFilters(selectedMake, selectedModel, year);
  };

  // Reset vehicle filters
  const resetVehicleFilters = () => {
    setSelectedYear('');
    setSelectedModel('');
    fetchModels(''); // Reset models
    setVehicleFiltersApplied(false);
    applyBaseFilters();
  };

  // Apply vehicle filters to products
  const applyFilters = (make: string, model: string, year: string) => {
    setVehicleFiltersApplied(!!(make || model || year));
    
    if (products.length > 0 && categorySlug) {
      // Filter products by category AND by vehicle specs if any are selected
      let filtered = products.filter(p => 
        p.product_type === 'affiliate' && p.is_approved
      );
      
      // Apply vehicle filters if specified
      if (make) {
        filtered = filtered.filter(p => {
          // Simulating vehicle compatibility - this would be based on actual metadata in a real app
          const compatibleMakes = p.title?.toLowerCase().includes(make.toLowerCase());
          return compatibleMakes;
        });
      }
      
      if (model) {
        filtered = filtered.filter(p => {
          // Simulating vehicle compatibility
          const compatibleModels = p.title?.toLowerCase().includes(model.toLowerCase());
          return compatibleModels;
        });
      }
      
      if (year) {
        filtered = filtered.filter(p => {
          // Simulating vehicle compatibility
          const compatibleYears = p.description?.includes(year);
          return compatibleYears;
        });
      }
      
      setFilteredProducts(filtered.slice(0, 6)); // Just showing a few sample products
    }
  };

  // Base filter function without vehicle specifics
  const applyBaseFilters = () => {
    if (products.length > 0 && categorySlug) {
      setFilteredProducts(products.filter(p => 
        p.product_type === 'affiliate' && p.is_approved
      ).slice(0, 6)); // Just showing a few sample products
    }
  };
  
  useEffect(() => {
    applyBaseFilters();
  }, [products, categorySlug]);

  return (
    <ShoppingPageLayout 
      title={categoryName} 
      description="Browse our selection of high-quality tools for your automotive needs"
      actions={
        <>
          <Link to="/shopping/categories">
            <Button variant="outline" className="mr-2">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Categories
            </Button>
          </Link>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Suggest Tool
          </Button>
        </>
      }
    >
      <div className="mb-6 p-4 bg-white border rounded-xl shadow-sm">
        <h3 className="text-lg font-medium mb-3">Find Vehicle-Specific Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Select value={selectedMake} onValueChange={handleMakeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Make" />
              </SelectTrigger>
              <SelectContent>
                {makes.map(make => (
                  <SelectItem key={make.make_id} value={make.make_id}>
                    {make.make_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedMake}>
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.model_name} value={model.model_name}>
                    {model.model_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={!vehicleFiltersApplied}
              onClick={resetVehicleFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        {vehicleFiltersApplied && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedMake && (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                Make: {makes.find(m => m.make_id === selectedMake)?.make_display || selectedMake}
              </Badge>
            )}
            {selectedModel && (
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                Model: {selectedModel}
              </Badge>
            )}
            {selectedYear && (
              <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                Year: {selectedYear}
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white p-3 rounded-xl shadow-sm border mb-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-2">
            <TabsTrigger value="all" className="rounded-full">All Tools</TabsTrigger>
            {subcategories.map(subcat => (
              <TabsTrigger 
                key={subcat} 
                value={subcat.toLowerCase().replace(/\s+/g, '-')}
                className="rounded-full"
              >
                {subcat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading tools...</p>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium mb-2">{product.title}</h3>
                      {product.price && (
                        <div className="font-semibold text-lg">${product.price.toFixed(2)}</div>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <Button className="w-full">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <h3 className="text-lg font-medium mb-2">No tools available yet</h3>
                <p className="text-muted-foreground mb-4">We're working on adding tools for this category.</p>
                <Button>Suggest a Tool</Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Create content tabs for each subcategory */}
        {subcategories.map(subcat => (
          <TabsContent key={subcat} value={subcat.toLowerCase().replace(/\s+/g, '-')}>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're currently adding {subcat} tools to our catalog.
              </p>
              <Button>Suggest a {subcat} Tool</Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </ShoppingPageLayout>
  );
};

export default CategoryDetailPage;
