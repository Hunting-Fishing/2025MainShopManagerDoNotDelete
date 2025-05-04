
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, PenLine, Trash2, Import, Download, Filter, Search, SortDesc } from 'lucide-react';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { AffiliateTool } from '@/types/affiliate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProductsList from './ProductsList';
import ProductForm from './ProductForm';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import TagSelector from './TagSelector';

const ProductsManagement = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct, exportProducts, importProducts } = useProductsManager();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AffiliateTool | null>(null);
  
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Extract unique categories and manufacturers for filter dropdowns
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.sort();
  }, [products]);
  
  const manufacturers = useMemo(() => {
    const uniqueManufacturers = [...new Set(products.map(product => product.manufacturer))];
    return uniqueManufacturers.sort();
  }, [products]);
  
  // Extract all tags from products
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(product => {
      // Assuming tags might be stored in description or some other field
      // This is just an example; adjust based on your actual data structure
      const productDescription = product.description || '';
      const matches = productDescription.match(/#(\w+)/g);
      if (matches) {
        matches.forEach(tag => tags.add(tag.slice(1)));
      }
    });
    return Array.from(tags);
  }, [products]);
  
  // Maximum price for slider
  const maxPrice = useMemo(() => {
    const prices = products.map(p => p.price || 0);
    return Math.max(...prices, 1000);
  }, [products]);
  
  // Filter products based on search query and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query filter
      const matchesSearch = 
        searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
      
      // Manufacturer filter
      const matchesManufacturer = manufacturerFilter === '' || product.manufacturer === manufacturerFilter;
      
      // Price range filter
      const productPrice = product.price || 0;
      const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
      
      // Tag filter
      let matchesTags = true;
      if (selectedTags.length > 0) {
        const productDescription = product.description || '';
        matchesTags = selectedTags.some(tag => productDescription.includes(`#${tag}`));
      }
      
      return matchesSearch && matchesCategory && matchesManufacturer && matchesPrice && matchesTags;
    });
  }, [products, searchQuery, categoryFilter, manufacturerFilter, priceRange, selectedTags]);

  const handleAddProduct = (productData: AffiliateTool) => {
    addProduct(productData);
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = (productData: AffiliateTool) => {
    if (currentProduct) {
      updateProduct(currentProduct.id, productData);
      setIsEditDialogOpen(false);
      setCurrentProduct(null);
    }
  };

  const handleDeleteProduct = () => {
    if (currentProduct) {
      deleteProduct(currentProduct.id);
      setIsDeleteDialogOpen(false);
      setCurrentProduct(null);
    }
  };

  const openEditDialog = (product: AffiliateTool) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: AffiliateTool) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleExport = () => {
    exportProducts(filteredProducts);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-2xl font-medium">Products Management</h3>
          <p className="text-muted-foreground mt-1">Add, edit, and manage affiliate products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => importProducts()}>
            <Import className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Search field */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search products by name, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter popover */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {(categoryFilter || manufacturerFilter || selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {(categoryFilter ? 1 : 0) + 
                       (manufacturerFilter ? 1 : 0) + 
                       (selectedTags.length > 0 ? 1 : 0) +
                       ((priceRange[0] > 0 || priceRange[1] < maxPrice) ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Products</h4>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="category-filter">Filter by Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger id="category-filter">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer-filter">Filter by Manufacturer</Label>
                    <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                      <SelectTrigger id="manufacturer-filter">
                        <SelectValue placeholder="All Manufacturers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Manufacturers</SelectItem>
                        {manufacturers.map((manufacturer) => (
                          <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price-filter">Price Range</Label>
                    <div className="pt-6 px-2">
                      <Slider
                        id="price-filter"
                        min={0}
                        max={maxPrice}
                        step={10}
                        value={[priceRange[0], priceRange[1]]}
                        onValueChange={(value) => setPriceRange([value[0], value[1]])}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <div>${priceRange[0]}</div>
                      <div>${priceRange[1]}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags-filter">Filter by Tags</Label>
                    <TagSelector 
                      selectedTags={selectedTags}
                      onChange={setSelectedTags}
                      suggestedTags={allTags}
                      placeholder="Select tags..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCategoryFilter('');
                        setManufacturerFilter('');
                        setPriceRange([0, maxPrice]);
                        setSelectedTags([]);
                      }}
                    >
                      Reset
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon">
              <SortDesc className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Products list */}
          <ProductsList 
            products={filteredProducts}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            loading={loading}
          />
          
          {/* Stats summary */}
          <div className="mt-4 flex gap-3">
            <Badge variant="outline">
              Total: {products.length} products
            </Badge>
            <Badge variant="outline">
              Filtered: {filteredProducts.length} products
            </Badge>
            {searchQuery && (
              <Badge variant="outline" className="gap-1">
                Search: <span className="font-medium">"{searchQuery}"</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new affiliate product to your shop.
            </DialogDescription>
          </DialogHeader>
          <ProductForm onSubmit={handleAddProduct} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product information.
            </DialogDescription>
          </DialogHeader>
          {currentProduct && <ProductForm product={currentProduct} onSubmit={handleEditProduct} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentProduct && (
              <div className="border rounded p-3">
                <h4 className="font-medium">{currentProduct.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{currentProduct.manufacturer}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;
