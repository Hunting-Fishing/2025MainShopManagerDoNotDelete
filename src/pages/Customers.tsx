
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, UserRound, AlertCircle, Loader2 } from "lucide-react";
import { Customer, getCustomerFullName } from "@/types/customer";
import { getAllCustomers } from "@/services/customer";
import { useToast } from "@/hooks/use-toast";
import { CustomerFilterControls, CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";
import { filterCustomers } from "@/utils/search/customerSearch";
import { checkSupabaseConnection } from "@/lib/supabase";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<CustomerFilters>({
    searchQuery: "",
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // First check Supabase connection
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionOk(isConnected);
      
      if (!isConnected) {
        setError("Unable to connect to the database. Please try again later.");
        setLoading(false);
        toast({
          title: "Connection Error",
          description: "Could not connect to the database. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    };
    
    checkConnection();
  }, [toast]);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (connectionOk !== true) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all customers in Customers component");
        const data = await getAllCustomers();
        console.log("Customer data received in component:", data);
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Failed to load customer data. Please try again.");
        toast({
          title: "Error fetching customers",
          description: "Could not load customer data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast, connectionOk]);
  
  useEffect(() => {
    // Apply filters whenever customers or filters change
    setFilteredCustomers(filterCustomers(customers, filters));
  }, [customers, filters]);

  const handleFilterChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-medium">Error loading customers</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }
    
    if (filteredCustomers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
            No customers found.
          </TableCell>
        </TableRow>
      );
    }
    
    return filteredCustomers.map((customer) => (
      <TableRow key={customer.id}>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <UserRound className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <Link 
                to={`/customers/${customer.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {getCustomerFullName(customer)}
              </Link>
              {customer.company && (
                <p className="text-xs text-slate-500">{customer.company}</p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <p>{customer.email}</p>
            <p className="text-slate-500">{customer.phone}</p>
          </div>
        </TableCell>
        <TableCell>
          <p className="text-sm">{customer.address}</p>
        </TableCell>
        <TableCell>
          {customer.tags && customer.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {customer.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-slate-400">No tags</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to={`/customers/${customer.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and view their service history
          </p>
        </div>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Link>
        </Button>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <CustomerFilterControls 
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
