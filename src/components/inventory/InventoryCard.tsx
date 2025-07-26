import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryItemExtended } from '@/types/inventory';
import { Edit, MoreVertical, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InventoryCardProps {
  item: InventoryItemExtended;
  onEdit?: (item: InventoryItemExtended) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function InventoryCard({ 
  item, 
  onEdit, 
  onDelete, 
  isSelected = false, 
  onToggleSelect 
}: InventoryCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out of stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStockLevel = () => {
    const quantity = Number(item.quantity) || 0;
    const reorderPoint = Number(item.reorder_point) || 0;
    
    if (quantity <= 0) return { level: 'out', color: 'text-red-600', icon: AlertTriangle };
    if (quantity <= reorderPoint) return { level: 'low', color: 'text-yellow-600', icon: AlertTriangle };
    return { level: 'good', color: 'text-green-600', icon: TrendingUp };
  };

  const stockInfo = getStockLevel();
  const StockIcon = stockInfo.icon;

  const handleCardClick = () => {
    navigate(`/inventory/item/${item.id}`);
  };

  return (
    <Card 
      className={`
        group hover:shadow-lg transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/20'}
        bg-card/50 backdrop-blur-sm
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}>
                View Details
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status and Stock Level */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(item.status)} variant="outline">
              {item.status}
            </Badge>
            <div className={`flex items-center space-x-1 ${stockInfo.color}`}>
              <StockIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.quantity} units</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-semibold">{formatCurrency(item.unit_price)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Value</p>
              <p className="font-semibold">{formatCurrency(item.unit_price * item.quantity)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            {item.category && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{item.category}</span>
              </div>
            )}
            {item.supplier && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-medium">{item.supplier}</span>
              </div>
            )}
            {item.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{item.location}</span>
              </div>
            )}
          </div>

          {/* Low Stock Warning */}
          {stockInfo.level !== 'good' && (
            <div className={`p-2 rounded-md ${
              stockInfo.level === 'out' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-xs ${
                stockInfo.level === 'out' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {stockInfo.level === 'out' 
                  ? 'Out of stock - Reorder needed' 
                  : `Low stock - Reorder at ${item.reorder_point} units`
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}