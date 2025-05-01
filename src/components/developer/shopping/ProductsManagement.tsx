import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from 'uuid';
import { isValidAmazonLink, extractAmazonASIN } from '@/utils/amazonUtils';

// Define the schema for product creation/edition
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  image_url: z.string().url({ message: "Invalid URL format" }),
  amazon_url: z.string().url({ message: "Invalid URL format" }).refine(isValidAmazonLink, {
    message: "Must be a valid Amazon product link.",
  }),
  category_id: z.string().uuid({ message: "Invalid category ID" }),
  manufacturer_id: z.string().uuid({ message: "Invalid manufacturer ID" }),
  price: z.number({
    invalid_type_error: "Price must be a number.",
  }).min(0, {
    message: "Price must be a positive number.",
  }),
  is_featured: z.boolean().default(false),
  is_approved: z.boolean().default(true),
});

// Define a type for the form values based on the schema
type FormValues = z.infer<typeof formSchema>;

interface Product {
  id: string;
  created_at: string;
  name: string;
  description: string;
  image_url: string;
  amazon_url: string;
  category_id: string;
  manufacturer_id: string;
  price: number;
  is_featured: boolean;
  is_approved: boolean;
  product_categories?: { name: string } | null;
  category_name?: string;
  manufacturer_name?: string;
}

interface ProductCategory {
  id: string;
  created_at: string;
  name: string;
}

interface Manufacturer {
  id: string;
  created_at: string;
  name: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image_url: "",
      amazon_url: "",
      category_id: "",
      manufacturer_id: "",
      price: 0,
      is_featured: false,
      is_approved: true,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // First get products with category names
      const { data: productsWithCategories, error: productsError } = await supabase
        .from('products')
        .select(`
        *,
        product_categories(name)
      `);
      
      if (productsError) throw productsError;

      // Then get manufacturer information separately
      const { data: manufacturersData, error: manufacturersError } = await supabase
        .from('manufacturers')
        .select('id, name');
      
      if (manufacturersError) throw manufacturersError;

      // Create a lookup for manufacturer names
      const manufacturerMap = manufacturersData.reduce((acc, manufacturer) => {
        acc[manufacturer.id] = manufacturer.name;
        return acc;
      }, {});

      // Map the products with both category and manufacturer names
      const productsWithDetails = productsWithCategories.map(product => ({
        ...product,
        category_name: product.product_categories?.name || 'Uncategorized',
        manufacturer_name: manufacturerMap[product.manufacturer_id] || 'Unknown'
      }));

      setProducts(productsWithDetails);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // Fetch manufacturers
      setManufacturers(manufacturersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(values)
          .eq('id', selectedProduct.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({ id: uuidv4(), ...values });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Product created successfully.",
        });
      }
      fetchData(); // Refresh product list
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        fetchData(); // Refresh product list
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      amazon_url: product.amazon_url,
      category_id: product.category_id,
      manufacturer_id: product.manufacturer_id,
      price: product.price,
      is_featured: product.is_featured,
      is_approved: product.is_approved,
    });
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    form.reset();
    setOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'category_name', headerName: 'Category', width: 150 },
    { field: 'manufacturer_name', headerName: 'Manufacturer', width: 150 },
    { field: 'price', headerName: 'Price', width: 100, valueFormatter: ({ value }) => `$${value}` },
    {
      field: 'is_featured',
      headerName: 'Featured',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={params.value}
          disabled
        />
      ),
    },
    {
      field: 'is_approved',
      headerName: 'Approved',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={params.value}
          disabled
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: GridRowParams) => (
        <div>
          <Button variant="secondary" size="sm" onClick={() => handleEdit(params.row as Product)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete((params.row as Product).id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleCreate}>Create Product</Button>
      </div>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredProducts}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Product</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Create Product"}</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? "Make changes to your product here. Click save when you're done."
                : "Create a new product by filling out the form below."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amazon_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amazon URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Amazon URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a manufacturer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {manufacturers.map((manufacturer) => (
                            <SelectItem key={manufacturer.id} value={manufacturer.id}>{manufacturer.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Product price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Is Featured</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_approved"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Is Approved</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
