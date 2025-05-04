
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from 'sonner';
import { deleteAffiliateTool, getAffiliateTools } from '@/services/tools/toolService';
import { useNavigate } from 'react-router-dom';
import { AffiliateTool } from '@/types/affiliate';
import { Badge } from '@/components/ui/badge';

const ProductsManagement = () => {
  const [products, setProducts] = useState<AffiliateTool[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getAffiliateTools();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteAffiliateTool(id);
        setProducts(products.filter(product => product.id !== id));
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'price', headerName: 'Price', width: 100, valueFormatter: ({ value }) => value ? `$${value.toFixed(2)}` : '' },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'manufacturer', headerName: 'Manufacturer', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams<AffiliateTool>) => (
        <div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/developer/shopping/products/edit/${params.row.id}`)}
            className="mr-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(params.row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const renderTags = (product: AffiliateTool) => {
    if (!product.tags || product.tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {product.tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  const rows = products.map(product => ({
    ...product,
    tags: renderTags(product),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button asChild>
          <Link to="/developer/shopping/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>
      
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </div>
    </div>
  );
};

export default ProductsManagement;
