
import React, { useState } from 'react';
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { Download, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ServicesPriceReportProps {
  categories: ServiceMainCategory[];
}

interface ServiceRecord {
  id: string;
  categoryName: string;
  subcategoryName: string;
  serviceName: string;
  time: number | null;
  price: number | null;
}

const ServicesPriceReport: React.FC<ServicesPriceReportProps> = ({ categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ServiceRecord; direction: 'asc' | 'desc' }>({
    key: 'categoryName',
    direction: 'asc'
  });
  
  // Generate flat list of all services
  const services: ServiceRecord[] = [];
  
  categories.forEach(cat => {
    cat.subcategories.forEach(sub => {
      sub.jobs.forEach(job => {
        services.push({
          id: job.id,
          categoryName: cat.name,
          subcategoryName: sub.name,
          serviceName: job.name,
          time: job.estimatedTime || null,
          price: job.price || null
        });
      });
    });
  });

  // Handle sorting
  const requestSort = (key: keyof ServiceRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatTime = (minutes: number | null) => {
    if (minutes === null) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Filter services
  const filteredServices = services.filter(service => {
    if (!searchTerm) return true;
    
    const searchRegex = new RegExp(searchTerm, 'i');
    
    return searchRegex.test(service.categoryName) || 
           searchRegex.test(service.subcategoryName) || 
           searchRegex.test(service.serviceName);
  });

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (a[sortConfig.key] === null && b[sortConfig.key] !== null) return sortConfig.direction === 'asc' ? 1 : -1;
    if (a[sortConfig.key] !== null && b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] === null && b[sortConfig.key] === null) return 0;

    if (typeof a[sortConfig.key] === 'string' && typeof b[sortConfig.key] === 'string') {
      return sortConfig.direction === 'asc'
        ? (a[sortConfig.key] as string).localeCompare(b[sortConfig.key] as string)
        : (b[sortConfig.key] as string).localeCompare(a[sortConfig.key] as string);
    }

    if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
      return sortConfig.direction === 'asc'
        ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
        : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
    }

    return 0;
  });

  // Export to CSV
  const handleExport = () => {
    // Create CSV header
    const csvHeader = ['Category', 'Subcategory', 'Service', 'Time (min)', 'Price'].join(',');
    
    // Create CSV rows
    const csvRows = sortedServices.map(service => {
      return [
        `"${service.categoryName}"`,
        `"${service.subcategoryName}"`,
        `"${service.serviceName}"`,
        service.time || '',
        service.price || ''
      ].join(',');
    });
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `services_price_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Services price report exported to CSV.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport} 
          className="flex items-center gap-2 ml-auto"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Services Price List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:text-primary w-[200px]" 
                    onClick={() => requestSort('categoryName')}
                  >
                    Category {sortConfig.key === 'categoryName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary w-[200px]" 
                    onClick={() => requestSort('subcategoryName')}
                  >
                    Subcategory {sortConfig.key === 'subcategoryName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary" 
                    onClick={() => requestSort('serviceName')}
                  >
                    Service {sortConfig.key === 'serviceName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary text-right w-[120px]" 
                    onClick={() => requestSort('time')}
                  >
                    Time {sortConfig.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-primary text-right w-[120px]" 
                    onClick={() => requestSort('price')}
                  >
                    Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32">
                      <p className="text-muted-foreground">No services found</p>
                      {searchTerm && (
                        <p className="text-sm text-muted-foreground mt-2">Try adjusting your search</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedServices.map((service) => (
                    <TableRow key={service.id} className="group">
                      <TableCell className="font-medium">{service.categoryName}</TableCell>
                      <TableCell>{service.subcategoryName}</TableCell>
                      <TableCell>{service.serviceName}</TableCell>
                      <TableCell className="text-right">
                        {formatTime(service.time)}
                      </TableCell>
                      <TableCell className="text-right">
                        {service.price !== null ? formatCurrency(service.price) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="bg-muted/30 rounded-lg p-4 border">
        <h3 className="text-sm font-medium mb-2">Report Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Services</div>
            <div className="text-lg font-semibold">{services.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Services with Pricing</div>
            <div className="text-lg font-semibold">
              {services.filter(s => s.price !== null && s.price > 0).length}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Services with Time</div>
            <div className="text-lg font-semibold">
              {services.filter(s => s.time !== null && s.time > 0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPriceReport;
