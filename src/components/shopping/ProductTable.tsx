
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types/shopping";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
}

export function ProductTable({ products, onViewDetails }: ProductTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.title}</TableCell>
              <TableCell>${product.price?.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  product.is_available 
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }>
                  {product.is_available ? "In Stock" : "Out of Stock"}
                </Badge>
              </TableCell>
              <TableCell>{product.average_rating || "N/A"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(product)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
