import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, PenLine, Trash2, Import, FileDownload, Filter, Search, SortDesc } from 'lucide-react';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { AffiliateTool } from '@/types/affiliate';
import ProductsList from './ProductsList';
import ProductForm from './ProductForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { exportToExcel } from '@/utils/export';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    exportToExcel(products, 'products');
  };

  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    return filtered;
  }, [products, searchQuery, filterCategory]);

  // Dummy data for categories and manufacturers
  const categories = [
    { id: '1', name: 'Category A' },
    { id: '2', name: 'Category B' },
    { id: '3', name: 'Category C' },
  ];

  const manufacturers = [
    { id: '1', name: 'Manufacturer X' },
    { id: '2', name: 'Manufacturer Y' },
    { id: '3', name: 'Manufacturer Z' },
  ];

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
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter Products</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <FileDownload className="h-4 w-4" />
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
            categories={categories}
            manufacturers={manufacturers}
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
