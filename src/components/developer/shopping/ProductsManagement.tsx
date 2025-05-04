
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, PenLine, Trash2, Import, Download, Filter, Search, SortDesc, X, Tag } from 'lucide-react';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { AffiliateTool } from '@/types/affiliate';
import ProductsList from './ProductsList';
import ProductForm from './ProductForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { exportToExcel } from '@/utils/export';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import TagSelector from './TagSelector';

interface ProductsManagementProps {
  categoryName?: string;
  categoryId?: string;
}

const ProductsManagement: React.FC<ProductsManagementProps> = ({ categoryName, categoryId }) => {
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productToEdit, setProductToEdit] = useState<AffiliateTool | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AffiliateTool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState('');
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { 
    products, 
    loading, 
    error, 
    updateProduct, 
    createProduct, 
    deleteProduct 
  } = useProductsManager({ 
    categoryType: 'tool', 
    categoryName: categoryName,
    categoryId: categoryId,
  });

  const handleEdit = (product: AffiliateTool) => {
    setProductToEdit(product);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleDelete = (product: AffiliateTool) => {
    setProductToDelete(product);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setIsDeleteConfirmationOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setProductToDelete(null);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setProductToEdit(null);
    setOpen(true);
  };

  const handleSave = async (productData: Partial<AffiliateTool>) => {
    try {
      if (isEditMode && productToEdit) {
        // Ensure ID is included when updating
        await updateProduct({ ...productToEdit, ...productData } as AffiliateTool);
      } else {
        await createProduct(productData);
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleExport = () => {
    exportToExcel(filteredProducts, 'products');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
    setFilterManufacturer('');
    setPriceRange([null, null]);
    setSelectedTags([]);
  };

  // Extract unique categories and manufacturers for filters
  const uniqueCategories = React.useMemo(() => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.sort();
  }, [products]);

  const uniqueManufacturers = React.useMemo(() => {
    const manufacturers = [...new Set(products.map(product => product.manufacturer))];
    return manufacturers.sort();
  }, [products]);

  // Extract all tags used in products (from categories, manufacturers, and other attributes)
  const availableTags = React.useMemo(() => {
    const tags = new Set<string>();
    products.forEach(product => {
      if (product.category) tags.add(product.category);
      if (product.manufacturer) tags.add(product.manufacturer);
      if (product.seller) tags.add(product.seller);
      if (product.featured) tags.add('Featured');
      if (product.bestSeller) tags.add('Best Seller');
    });
    return Array.from(tags).sort();
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.manufacturer.toLowerCase().includes(query) ||
        (product.seller && product.seller.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Manufacturer filter
    if (filterManufacturer) {
      filtered = filtered.filter(product => product.manufacturer === filterManufacturer);
    }

    // Price range filter
    if (priceRange[0] !== null) {
      filtered = filtered.filter(product => 
        (product.salePrice || product.price || 0) >= (priceRange[0] || 0)
      );
    }

    if (priceRange[1] !== null) {
      filtered = filtered.filter(product => 
        (product.salePrice || product.price || 0) <= (priceRange[1] || Infinity)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product => {
        const productTags = [
          product.category,
          product.manufacturer,
          product.seller,
          product.featured ? 'Featured' : '',
          product.bestSeller ? 'Best Seller' : ''
        ].filter(Boolean);
        
        return selectedTags.some(tag => productTags.includes(tag));
      });
    }

    return filtered;
  }, [products, searchQuery, filterCategory, filterManufacturer, priceRange, selectedTags]);

  const hasActiveFilters = searchQuery || filterCategory || filterManufacturer || priceRange[0] !== null || priceRange[1] !== null || selectedTags.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Products {categoryName ? `in ${categoryName}` : ''}
          {products?.length > 0 && (
            <Badge variant="secondary" className="ml-2">{products.length}</Badge>
          )}
        </h2>
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
            />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant={hasActiveFilters ? "default" : "outline"} 
                      size="icon"
                      className={hasActiveFilters ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                    >
                      <Filter className="h-4 w-4" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                          {(filterCategory ? 1 : 0) + 
                           (filterManufacturer ? 1 : 0) + 
                           ((priceRange[0] !== null || priceRange[1] !== null) ? 1 : 0) + 
                           (selectedTags.length > 0 ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4 p-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter Products
                        </h3>
                        {hasActiveFilters && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="h-8 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category-filter">Category</Label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger id="category-filter" className="w-full">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {uniqueCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="manufacturer-filter">Manufacturer</Label>
                        <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
                          <SelectTrigger id="manufacturer-filter" className="w-full">
                            <SelectValue placeholder="All Manufacturers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Manufacturers</SelectItem>
                            {uniqueManufacturers.map(manufacturer => (
                              <SelectItem key={manufacturer} value={manufacturer}>
                                {manufacturer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Price Range</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={priceRange[0] === null ? '' : priceRange[0]}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              setPriceRange([value, priceRange[1]]);
                            }}
                            className="w-full"
                          />
                          <span>to</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={priceRange[1] === null ? '' : priceRange[1]}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
                              setPriceRange([priceRange[0], value]);
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          <Label>Filter by Tags</Label>
                        </div>
                        <TagSelector
                          selectedTags={selectedTags}
                          onChange={setSelectedTags}
                          suggestedTags={availableTags}
                          placeholder="Add tags to filter..."
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter Products</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Products</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-sm font-medium text-slate-500">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2 pr-1 py-1">
              <span className="text-xs">Search: {searchQuery}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-slate-100" 
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filterCategory && (
            <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2 pr-1 py-1">
              <span className="text-xs">Category: {filterCategory}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-slate-100" 
                onClick={() => setFilterCategory('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filterManufacturer && (
            <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2 pr-1 py-1">
              <span className="text-xs">Manufacturer: {filterManufacturer}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-slate-100" 
                onClick={() => setFilterManufacturer('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(priceRange[0] !== null || priceRange[1] !== null) && (
            <Badge variant="outline" className="bg-white flex items-center gap-1 pl-2 pr-1 py-1">
              <span className="text-xs">
                Price: {priceRange[0] !== null ? `$${priceRange[0]}` : '$0'} - {priceRange[1] !== null ? `$${priceRange[1]}` : 'Any'}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-slate-100" 
                onClick={() => setPriceRange([null, null])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedTags.map(tag => (
            <Badge key={tag} variant="outline" className="bg-white flex items-center gap-1 pl-2 pr-1 py-1">
              <span className="text-xs">Tag: {tag}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 hover:bg-slate-100" 
                onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="ml-auto text-xs h-7 px-2"
          >
            Clear All
          </Button>
        </div>
      )}

      {filteredProducts.length > 0 && filteredProducts.length !== products.length && (
        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}

      <ProductsList
        products={filteredProducts}
        loading={loading}
        categoryName={categoryName}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={productToEdit}
            onSubmit={handleSave}
            onCancel={handleCancel}
            categories={uniqueCategories.map(name => ({ id: name, name }))}
            manufacturers={uniqueManufacturers.map(name => ({ id: name, name }))}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete {productToDelete?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsManagement;
