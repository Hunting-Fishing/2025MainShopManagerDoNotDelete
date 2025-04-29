
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, Filter, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { Product } from '@/types/shopping';
import { useCategories } from '@/hooks/useCategories';

interface VehicleFilters {
  year?: string;
  make?: string;
  model?: string;
  engine?: string;
}

const CategoryDetailPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const { categories, fetchCategoryBySlug } = useCategories();

  // Vehicle filter options
  const years = ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];
  const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Nissan"];
  const models = filters.make ? 
    filters.make === "Toyota" ? ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"] : 
    filters.make === "Honda" ? ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"] : 
    filters.make === "Ford" ? ["F-150", "Escape", "Explorer", "Mustang", "Focus"] : 
    [] : [];
  const engines = filters.model ? ["2.0L I4", "2.5L I4", "3.5L V6", "5.0L V8"] : [];

  useEffect(() => {
    const loadCategory = async () => {
      if (categorySlug) {
        setIsLoading(true);
        try {
          const categoryData = await fetchCategoryBySlug(categorySlug);
          setCategory(categoryData);
          
          // Now load mock products for this category
          setProducts(getMockProductsForCategory(categorySlug));
        } catch (error) {
          console.error("Error loading category:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadCategory();
  }, [categorySlug, fetchCategoryBySlug]);

  const handleFilterChange = (key: keyof VehicleFilters, value: string) => {
    // Reset dependent filters when parent filter changes
    if (key === 'year') {
      setFilters({ year: value });
    } else if (key === 'make') {
      setFilters({ ...filters, make: value, model: undefined, engine: undefined });
    } else if (key === 'model') {
      setFilters({ ...filters, model: value, engine: undefined });
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getMockProductsForCategory = (slug: string): Product[] => {
    // This would normally come from an API based on the category
    return [
      {
        id: "1",
        title: "Professional Mechanics Tool Set (148-Piece)",
        description: "Complete mechanics tool set with quick-release ratchets, extension bars, and universal joints",
        image_url: "https://placehold.co/300x200",
        price: 149.99,
        affiliate_link: "https://amazon.com/product1",
        category_id: slug,
        product_type: "affiliate" as const,
        is_featured: true,
        is_bestseller: true,
        is_approved: true,
        created_at: "2023-04-15T10:30:00Z",
        updated_at: "2023-04-15T10:30:00Z",
        average_rating: 4.7,
        review_count: 253
      },
      {
        id: "2",
        title: "Digital Torque Wrench (10-150 ft-lb)",
        description: "High precision digital torque wrench with LCD display and multiple measurement modes",
        image_url: "https://placehold.co/300x200",
        price: 129.99,
        affiliate_link: "https://amazon.com/product2",
        category_id: slug,
        product_type: "affiliate" as const,
        is_featured: false,
        is_bestseller: false,
        is_approved: true,
        created_at: "2023-05-20T14:15:00Z",
        updated_at: "2023-05-20T14:15:00Z",
        average_rating: 4.5,
        review_count: 189,
        sale_price: 99.99
      },
      {
        id: "3",
        title: "3-Ton Floor Jack with Rapid Pump",
        description: "Low-profile floor jack with dual pump pistons for quick lifting, ideal for cars and SUVs",
        image_url: "https://placehold.co/300x200",
        price: 189.99,
        affiliate_link: "https://amazon.com/product3",
        category_id: slug,
        product_type: "affiliate" as const,
        is_featured: true,
        is_bestseller: true,
        is_approved: true,
        created_at: "2023-06-10T09:45:00Z",
        updated_at: "2023-06-10T09:45:00Z",
        average_rating: 4.8,
        review_count: 327
      },
      {
        id: "4",
        title: "LED Work Light with Magnetic Base",
        description: "Rechargeable LED work light with adjustable brightness and magnetic mounting options",
        image_url: "https://placehold.co/300x200",
        price: 49.99,
        affiliate_link: "https://amazon.com/product4",
        category_id: slug,
        product_type: "affiliate" as const,
        is_featured: false,
        is_bestseller: true,
        is_approved: true,
        created_at: "2023-07-05T16:20:00Z",
        updated_at: "2023-07-05T16:20:00Z",
        average_rating: 4.6,
        review_count: 218
      },
      {
        id: "5",
        title: "OBD2 Scanner & Diagnostic Tool",
        description: "Advanced diagnostic scanner with real-time data, code reading and clearing for all vehicles",
        image_url: "https://placehold.co/300x200",
        price: 79.99,
        affiliate_link: "https://amazon.com/product5",
        category_id: slug,
        product_type: "affiliate" as const,
        is_featured: true,
        is_bestseller: false,
        is_approved: true,
        created_at: "2023-08-15T11:10:00Z",
        updated_at: "2023-08-15T11:10:00Z",
        average_rating: 4.4,
        review_count: 176,
        sale_price: 59.99
      },
      {
        id: "6",
        title: "Breaker Bar Set (1/2-Inch Drive)",
        description: "Heavy-duty breaker bar set for stuck or high-torque fasteners, with comfort grip handle",
        image_url: "https://placehold.co/300x200",
        price: 39.99,
        affiliate_link: "https://amazon.com/product6",
        category_id: slug,
        product_type: "affiliate" as const,
        is_featured: false,
        is_bestseller: false,
        is_approved: true,
        created_at: "2023-09-20T13:25:00Z",
        updated_at: "2023-09-20T13:25:00Z",
        average_rating: 4.7,
        review_count: 143
      }
    ];
  };

  // Don't show anything during load
  if (isLoading) {
    return (
      <ShoppingPageLayout title="Loading..." description="Please wait...">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ShoppingPageLayout>
    );
  }

  // Show not found if category doesn't exist
  if (!category) {
    return (
      <ShoppingPageLayout title="Category Not Found" description="The requested category could not be found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="mb-6 text-muted-foreground">The category you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/shopping/categories">Back to Categories</Link>
          </Button>
        </div>
      </ShoppingPageLayout>
    );
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <ShoppingPageLayout 
      title={category.name || "Category"} 
      description={category.description || "Browse products in this category"}
    >
      {/* Navigation and filter section */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link to="/shopping/categories">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Categories
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link to="/shopping">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Shop Home
              </Link>
            </Button>
          </div>
          
          <h1 className="text-2xl font-bold">{category.name} Tools</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Vehicle Filters</h3>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm"
                className="ml-auto h-8 text-xs"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Year</label>
              <Select 
                value={filters.year} 
                onValueChange={(value) => handleFilterChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Make</label>
              <Select 
                value={filters.make} 
                onValueChange={(value) => handleFilterChange('make', value)}
                disabled={!filters.year}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Model</label>
              <Select 
                value={filters.model} 
                onValueChange={(value) => handleFilterChange('model', value)}
                disabled={!filters.make}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Engine</label>
              <Select 
                value={filters.engine} 
                onValueChange={(value) => handleFilterChange('engine', value)}
                disabled={!filters.model}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Engine" />
                </SelectTrigger>
                <SelectContent>
                  {engines.map(engine => (
                    <SelectItem key={engine} value={engine}>{engine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.year && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Year: {filters.year}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters({ ...filters, year: undefined })}
                  />
                </Badge>
              )}
              {filters.make && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Make: {filters.make}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters({ ...filters, make: undefined, model: undefined, engine: undefined })}
                  />
                </Badge>
              )}
              {filters.model && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Model: {filters.model}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters({ ...filters, model: undefined, engine: undefined })}
                  />
                </Badge>
              )}
              {filters.engine && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Engine: {filters.engine}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setFilters({ ...filters, engine: undefined })}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Card key={product.id} className="overflow-hidden h-full flex flex-col">
            <div className="relative h-48 bg-gray-100">
              <img 
                src={product.image_url || 'https://placehold.co/300x200?text=No+Image'} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.sale_price && (
                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                  Sale
                </Badge>
              )}
              {product.is_bestseller && (
                <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                  Bestseller
                </Badge>
              )}
            </div>
            
            <CardContent className="flex-grow p-4">
              <div>
                <h3 className="font-medium text-lg mb-1">{product.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </div>
              
              <div className="flex items-center mt-2 text-amber-500">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.floor(product.average_rating || 0) ? 'text-amber-500' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
                <span className="text-xs ml-1 text-muted-foreground">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <div>
                {product.sale_price ? (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-red-600">${product.sale_price}</span>
                    <span className="text-sm line-through text-muted-foreground">${product.price}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold">${product.price}</span>
                )}
              </div>
              
              <Button 
                variant="default" 
                size="sm" 
                className="ml-auto"
                onClick={() => {
                  window.open(product.affiliate_link, "_blank", "noopener,noreferrer");
                }}
              >
                View on Amazon
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Empty state if no products */}
      {products.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-6">We couldn't find any products matching your criteria</p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>Clear Filters</Button>
          )}
        </div>
      )}
    </ShoppingPageLayout>
  );
};

export default CategoryDetailPage;
