import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Plus, 
  Search,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { useGunsmithParts, useCreateGunsmithPart } from '@/hooks/useGunsmith';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function GunsmithParts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    quantity: '',
    min_quantity: '',
    unit_cost: '',
    retail_price: '',
    location: '',
    supplier: ''
  });
  
  const { data: parts, isLoading } = useGunsmithParts();
  const createPart = useCreateGunsmithPart();

  const filteredParts = parts?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockParts = parts?.filter(p => p.quantity <= p.min_quantity) || [];

  const handleSubmit = () => {
    createPart.mutate({
      part_number: formData.part_number || undefined,
      name: formData.name,
      category: formData.category || undefined,
      manufacturer: formData.manufacturer || undefined,
      quantity: formData.quantity ? parseInt(formData.quantity) : 0,
      min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : 0,
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : undefined,
      retail_price: formData.retail_price ? parseFloat(formData.retail_price) : undefined,
      location: formData.location || undefined
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          part_number: '', name: '', description: '', category: '',
          manufacturer: '', quantity: '', min_quantity: '', unit_cost: '',
          retail_price: '', location: '', supplier: ''
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-amber-600" />
              Parts Inventory
            </h1>
            <p className="text-muted-foreground mt-1">Manage gunsmith parts and supplies</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Part</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Part Number</Label>
                  <Input
                    value={formData.part_number}
                    onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Springs, Triggers"
                  />
                </div>
                <div>
                  <Label>Manufacturer</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Min Quantity</Label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Retail Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.retail_price}
                    onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Shelf A-3"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={!formData.name || createPart.isPending}
              >
                {createPart.isPending ? 'Adding...' : 'Add Part'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-foreground">
              {lowStockParts.length} part(s) are at or below minimum stock level
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Parts List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredParts?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No parts in inventory</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredParts?.map((part) => (
                <div 
                  key={part.id} 
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{part.name}</span>
                      {part.part_number && (
                        <Badge variant="outline">{part.part_number}</Badge>
                      )}
                      {part.category && (
                        <Badge variant="secondary">{part.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {part.manufacturer}
                      {part.location && ` • Location: ${part.location}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={part.quantity <= part.min_quantity ? 'destructive' : 'default'}
                        className="text-sm"
                      >
                        Qty: {part.quantity}
                      </Badge>
                    </div>
                    {part.retail_price && (
                      <p className="text-sm text-muted-foreground">
                        ${part.retail_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
