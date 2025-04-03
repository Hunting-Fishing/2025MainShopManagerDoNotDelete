
import React, { useState } from 'react';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { ProductsTable } from '@/components/shopping/admin/ProductsTable';
import { ProductForm } from '@/components/shopping/admin/ProductForm';
import { CategoryForm } from '@/components/shopping/admin/CategoryForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCategories } from '@/hooks/useCategories';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function ShoppingAdmin() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthUser();
  const { categories } = useCategories();
  
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect non-admin users
  React.useEffect(() => {
    if (isAdmin === false) {
      navigate('/shopping');
    }
  }, [isAdmin, navigate]);

  const handleEditProduct = (productId: string) => {
    setEditProductId(productId);
  };

  const handleEditCategory = (categoryId: string) => {
    setEditCategoryId(categoryId);
  };

  const handleProductFormSuccess = () => {
    setEditProductId(null);
    setShowAddProduct(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleCategoryFormSuccess = () => {
    setEditCategoryId(null);
    setShowAddCategory(false);
    setRefreshKey(prev => prev + 1);
  };

  if (isAdmin === undefined) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/shopping')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Shopping Admin</h1>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Products</h2>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          
          <ProductsTable 
            key={refreshKey}
            onEdit={handleEditProduct}
            onRefresh={() => setRefreshKey(prev => prev + 1)}
          />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Categories</h2>
            <Button onClick={() => setShowAddCategory(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      <TableRow>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>Top-level Category</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCategory(category.id)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {category.subcategories?.map((subCategory) => (
                        <TableRow key={subCategory.id}>
                          <TableCell className="font-medium pl-8">{subCategory.name}</TableCell>
                          <TableCell>{subCategory.slug}</TableCell>
                          <TableCell>Subcategory of {category.name}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditCategory(subCategory.id)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Product Form Dialog */}
      <Dialog 
        open={showAddProduct || !!editProductId} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddProduct(false);
            setEditProductId(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editProductId 
                ? 'Update the product details below.' 
                : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            productId={editProductId || undefined}
            onSuccess={handleProductFormSuccess}
            onCancel={() => {
              setShowAddProduct(false);
              setEditProductId(null);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Category Form Dialog */}
      <Dialog 
        open={showAddCategory || !!editCategoryId} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddCategory(false);
            setEditCategoryId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategoryId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editCategoryId 
                ? 'Update the category details below.' 
                : 'Fill in the details to add a new category.'}
            </DialogDescription>
          </DialogHeader>
          
          <CategoryForm 
            categoryId={editCategoryId || undefined}
            onSuccess={handleCategoryFormSuccess}
            onCancel={() => {
              setShowAddCategory(false);
              setEditCategoryId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
}
