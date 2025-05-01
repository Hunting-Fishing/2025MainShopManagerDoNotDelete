
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AffiliateProduct, ProductTier } from '@/types/affiliate';
import ProductTierBadge from '@/components/affiliate/ProductTierBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Pencil, Trash2, Star } from 'lucide-react';

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

export default function ProductsManagement() {
  const [products, setProducts] = useState<AffiliateProduct[]>(sampleProducts);
  const [editProduct, setEditProduct] = useState<AffiliateProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const handleSaveProduct = (product: AffiliateProduct) => {
    if (editProduct) {
      // Update existing product
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      // Add new product
      const newProduct = { ...product, id: String(Date.now()) };
      setProducts([...products, newProduct]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleToggleFeatured = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <ProductForm 
              product={editProduct} 
              onSave={handleSaveProduct} 
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Featured</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${product.isFeatured ? 'text-yellow-500' : 'text-slate-300'}`}
                      onClick={() => handleToggleFeatured(product.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <ProductTierBadge tier={product.tier} />
                  </TableCell>
                  <TableCell>${product.retailPrice.toFixed(2)}</TableCell>
                  <TableCell>{product.source}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => setEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <ProductForm 
                          product={product} 
                          onSave={handleSaveProduct}
                          onCancel={() => setIsDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface ProductFormProps {
  product: AffiliateProduct | null;
  onSave: (product: AffiliateProduct) => void;
  onCancel: () => void;
}

function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState<AffiliateProduct>(
    product || {
      id: '',
      name: '',
      description: '',
      imageUrl: '',
      tier: 'midgrade',
      category: '',
      retailPrice: 0,
      affiliateUrl: '',
      source: 'amazon',
      isFeatured: false,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Update the product details below." 
            : "Enter the details for the new product."}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retailPrice">Price</Label>
            <Input
              id="retailPrice"
              name="retailPrice"
              type="number"
              step="0.01"
              value={formData.retailPrice}
              onChange={(e) => setFormData({...formData, retailPrice: Number(e.target.value)})}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <Select 
              value={formData.tier} 
              onValueChange={(value: ProductTier) => setFormData({...formData, tier: value})}
            >
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select a tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="midgrade">Mid-Grade</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hand-tools">Hand Tools</SelectItem>
                <SelectItem value="power-tools">Power Tools</SelectItem>
                <SelectItem value="diagnostic">Diagnostic Tools</SelectItem>
                <SelectItem value="clips-fasteners">Body Clips & Fasteners</SelectItem>
                <SelectItem value="specialty">Specialty Tools</SelectItem>
                <SelectItem value="shop-equipment">Shop Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
          />
          {formData.imageUrl && (
            <div className="mt-2 h-24 w-24 overflow-hidden rounded border">
              <img 
                src={formData.imageUrl} 
                alt="Product preview" 
                className="h-full w-full object-cover"
                onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliateUrl">Affiliate URL</Label>
          <Input
            id="affiliateUrl"
            name="affiliateUrl"
            value={formData.affiliateUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select 
              value={formData.source} 
              onValueChange={(value: 'amazon' | 'other') => setFormData({...formData, source: value})}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end space-x-2">
            <Checkbox 
              id="isFeatured" 
              checked={formData.isFeatured} 
              onCheckedChange={(checked) => 
                setFormData({...formData, isFeatured: checked as boolean})
              }
            />
            <Label htmlFor="isFeatured">Feature this product</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEditing ? "Update" : "Add"} Product</Button>
        </DialogFooter>
      </form>
    </>
  );
}
