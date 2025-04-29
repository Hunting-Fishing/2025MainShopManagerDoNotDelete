
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { ProductGrid } from '@/components/shopping/ProductGrid';
import { ProductFilters } from '@/components/shopping/ProductFilters';
import { useProducts } from '@/hooks/useProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Filter, ChevronLeft } from 'lucide-react';

const DUMMY_PRODUCTS = [
  {
    id: "1",
    title: "Professional 150-Piece Mechanic's Tool Set",
    description: "Complete socket set with quick-release ratchets, extension bars, and universal joints",
    image_url: "https://images.unsplash.com/photo-1581241729235-3c55652a37cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    price: 199.99,
    affiliate_link: "https://amazon.com/product",
    category_id: "hand-tools",
    product_type: 'affiliate',
    is_featured: true,
    is_bestseller: true,
    is_approved: true,
    created_at: "2023-04-15",
    updated_at: "2023-05-10",
    average_rating: 4.8,
    review_count: 254
  },
  {
    id: "2",
    title: "Digital Torque Wrench 1/2-inch Drive",
    description: "Precision digital torque wrench with LED display and audible alert",
    image_url: "https://images.unsplash.com/photo-1580402427914-a6cc60d7d27f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    price: 129.95,
    affiliate_link: "https://amazon.com/product",
    category_id: "hand-tools",
    product_type: 'affiliate',
    is_featured: false,
    is_bestseller: false,
    is_approved: true,
    created_at: "2023-03-22",
    updated_at: "2023-04-05",
    average_rating: 4.5,
    review_count: 89
  },
  {
    id: "3",
    title: "20V MAX Cordless Drill/Driver Kit",
    description: "Powerful drill with lithium-ion battery, charger, and carrying case",
    image_url: "https://images.unsplash.com/photo-1562516710-38a6fa229714?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    price: 149.99,
    sale_price: 119.99,
    affiliate_link: "https://amazon.com/product",
    category_id: "power-tools",
    product_type: 'affiliate',
    is_featured: true,
    is_bestseller: true,
    is_approved: true,
    created_at: "2023-02-10",
    updated_at: "2023-04-18",
    average_rating: 4.9,
    review_count: 376
  },
  {
    id: "4",
    title: "OBD2 Scanner Bluetooth Car Diagnostic Tool",
    description: "Wireless OBD scanner compatible with iOS and Android devices",
    image_url: "https://images.unsplash.com/photo-1562184552-08e0279078d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    price: 79.99,
    sale_price: 59.99,
    affiliate_link: "https://amazon.com/product",
    category_id: "diagnostic-tools",
    product_type: 'affiliate',
    is_featured: false,
    is_bestseller: false,
    is_approved: true,
    created_at: "2023-01-15",
    updated_at: "2023-03-20",
    average_rating: 4.2,
    review_count: 128
  },
  {
    id: "5",
    title: "Heavy Duty 3-Ton Floor Jack",
    description: "Professional hydraulic floor jack with rapid pump technology",
    image_url: "https://images.unsplash.com/photo-1631890470413-628467959685?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    price: 189.95,
    affiliate_link: "https://amazon.com/product",
    category_id: "shop-equipment",
    product_type: 'affiliate',
    is_featured: false,
    is_bestseller: true,
    is_approved: true,
    created_at: "2023-03-01",
    updated_at: "2023-04-12",
    average_rating: 4.7,
    review_count: 203
  },
  {
    id: "6",
    title: "Universal Brake Caliper Tool Set",
    description: "Complete kit for compressing brake pistons during pad replacement",
    image_url: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    price: 49.99,
    affiliate_link: "https://amazon.com/product",
    category_id: "specialty-tools",
    product_type: 'affiliate',
    is_featured: true,
    is_bestseller: false,
    is_approved: true,
    created_at: "2023-02-20",
    updated_at: "2023-04-05",
    average_rating: 4.6,
    review_count: 152
  }
];

const SUBCATEGORIES = {
  'hand-tools': [
    {id: 'wrenches', name: 'Wrenches & Sets'},
    {id: 'sockets', name: 'Sockets & Drives'},
    {id: 'pliers', name: 'Pliers'},
    {id: 'screwdrivers', name: 'Screwdrivers'},
    {id: 'hammers', name: 'Hammers & Striking'},
  ],
  'power-tools': [
    {id: 'drills', name: 'Drills & Drivers'},
    {id: 'saws', name: 'Saws'},
    {id: 'grinders', name: 'Grinders'},
    {id: 'sanders', name: 'Sanders'},
    {id: 'air-tools', name: 'Air Tools'},
  ],
  'diagnostic-tools': [
    {id: 'scanners', name: 'OBD Scanners'},
    {id: 'testers', name: 'Electrical Testers'},
    {id: 'meters', name: 'Meters'},
    {id: 'inspection', name: 'Inspection Tools'},
    {id: 'analyzers', name: 'Engine Analyzers'},
  ]
};

const CategoryDetailPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { products: fetchedProducts, isLoading } = useProducts({ categoryId: categorySlug });

  // Mock products while we develop the real API integration
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [subcategories, setSubcategories] = useState<{id: string, name: string}[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Vehicle filter states
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [makeFilter, setMakeFilter] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const [engineFilter, setEngineFilter] = useState<string | null>(null);

  const years = ["2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];
  const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi"];
  const models = ["Camry", "Civic", "F-150", "Silverado", "Altima", "3 Series", "C-Class", "A4"];
  const engines = ["2.0L I4", "2.5L I4", "3.0L V6", "3.5L V6", "5.0L V8", "6.2L V8", "1.8L I4 Turbo"];

  const categoryNameMap: Record<string, string> = {
    'hand-tools': 'Hand Tools',
    'power-tools': 'Power Tools',
    'diagnostic-tools': 'Diagnostic Tools',
    'shop-equipment': 'Shop Equipment',
    'specialty-tools': 'Specialty Tools',
    'body-shop': 'Body Shop',
    'cleaning-supplies': 'Cleaning Supplies',
    'lighting': 'Lighting',
    'lifting-equipment': 'Lifting Equipment'
  };

  useEffect(() => {
    if (categorySlug) {
      // Filter products by category in mock scenario
      setProducts(
        DUMMY_PRODUCTS.filter(product => 
          product.category_id === categorySlug || 
          !categorySlug || 
          categorySlug === 'all'
        )
      );

      // Set available subcategories
      if (categorySlug in SUBCATEGORIES) {
        setSubcategories(SUBCATEGORIES[categorySlug as keyof typeof SUBCATEGORIES]);
      } else {
        setSubcategories([]);
      }
    }
  }, [categorySlug]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Filter products by subcategory (in real implementation)
  };

  // Get the proper category name for display
  const categoryName = categorySlug ? (categoryNameMap[categorySlug] || categorySlug) : 'All Categories';

  const clearAllFilters = () => {
    setYearFilter(null);
    setMakeFilter(null);
    setModelFilter(null);
    setEngineFilter(null);
  };

  const hasActiveFilters = yearFilter || makeFilter || modelFilter || engineFilter;

  return (
    <ShoppingPageLayout
      title={categoryName}
      description={`Browse our selection of ${categoryName.toLowerCase()}`}
      actions={
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/shopping/categories')}
            className="mr-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Categories
          </Button>
        </>
      }
    >
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          {subcategories && subcategories.length > 0 ? (
            <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:w-fit lg:grid-cols-none">
                <TabsTrigger value="all">All</TabsTrigger>
                {subcategories.map(subcat => (
                  <TabsTrigger key={subcat.id} value={subcat.id}>
                    {subcat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <div></div> 
          )}
          
          <Button variant="outline" size="sm" className="lg:ml-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Vehicle-specific filters */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Filter by Vehicle</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select 
              className="border rounded-md p-2 text-sm bg-white"
              value={yearFilter || ''}
              onChange={(e) => setYearFilter(e.target.value || null)}
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select 
              className="border rounded-md p-2 text-sm bg-white"
              value={makeFilter || ''}
              onChange={(e) => setMakeFilter(e.target.value || null)}
            >
              <option value="">Make</option>
              {makes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            
            <select 
              className="border rounded-md p-2 text-sm bg-white"
              value={modelFilter || ''}
              onChange={(e) => setModelFilter(e.target.value || null)}
            >
              <option value="">Model</option>
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            
            <select 
              className="border rounded-md p-2 text-sm bg-white"
              value={engineFilter || ''}
              onChange={(e) => setEngineFilter(e.target.value || null)}
            >
              <option value="">Engine</option>
              {engines.map(engine => (
                <option key={engine} value={engine}>{engine}</option>
              ))}
            </select>
          </div>
          
          {/* Active filters */}
          {hasActiveFilters && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-500">Active filters:</span>
                {yearFilter && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                    {yearFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setYearFilter(null)} 
                    />
                  </Badge>
                )}
                {makeFilter && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                    {makeFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setMakeFilter(null)} 
                    />
                  </Badge>
                )}
                {modelFilter && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                    {modelFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setModelFilter(null)} 
                    />
                  </Badge>
                )}
                {engineFilter && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                    {engineFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setEngineFilter(null)} 
                    />
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 px-2 text-slate-600"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <ProductGrid 
          products={products} 
          isLoading={false} 
          emptyMessage={`No ${categoryName.toLowerCase()} found. Try adjusting your filters.`} 
        />
      )}
    </ShoppingPageLayout>
  );
};

export default CategoryDetailPage;
